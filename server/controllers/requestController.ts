import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { db, IUploadedDoc } from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';
import { auditService } from '../services/auditService';
import { govService } from '../services/government/GovernmentDocumentService';
import { config } from '../config/config';

export const requestController = {
  createRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { documentTypeId, applicationDataRaw } = req.body;
      if (!documentTypeId) {
        return res.status(400).json({ success: false, message: 'documentTypeId is required' });
      }

      const docType = db.documentTypes.findById(documentTypeId);
      if (!docType || !docType.isActive) {
        return res.status(400).json({ success: false, message: 'Invalid or inactive document type selected.' });
      }

      let applicationData: Record<string, any> = {};
      try {
        applicationData = typeof applicationDataRaw === 'string' ? JSON.parse(applicationDataRaw) : applicationDataRaw || {};
      } catch {
        applicationData = {};
      }

      // Process uploaded files
      const files = (req.files as Express.Multer.File[]) || [];
      const uploadedDocs: IUploadedDoc[] = [];

      files.forEach((file) => {
        // fieldname may carry the document type requirement name or index
        const reqDocName = file.fieldname.startsWith('doc_')
          ? decodeURIComponent(file.fieldname.replace('doc_', ''))
          : file.originalname;

        uploadedDocs.push({
          id: `upl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          documentType: reqDocName,
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
          uploadedBy: req.user!.id,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'PENDING',
        });
      });

      // Calculate estimated completion date (submittedAt + processingTime in business days)
      const now = new Date();
      const completionDate = new Date(now);
      completionDate.setDate(completionDate.getDate() + (docType.processingTime || 7));

      const newRequest = db.requests.create({
        citizen: req.user.id,
        documentType: docType.id,
        applicationData,
        uploadedDocuments: uploadedDocs,
        status: 'SUBMITTED',
        currentDepartment: docType.department,
        remarks: 'Application submitted online by citizen.',
        expectedCompletionDate: completionDate.toISOString(),
      });

      // Create initial status history entry
      db.statusHistories.create({
        request: newRequest.id,
        oldStatus: 'SUBMITTED',
        newStatus: 'SUBMITTED',
        changedBy: req.user.id,
        changedByRole: 'citizen',
        remarks: `Application for ${docType.name} submitted successfully with ${uploadedDocs.length} attachment(s).`,
      });

      // Citizen notification
      notificationService.createNotification(
        req.user.id,
        'Application Submitted',
        `Your application for ${docType.name} (${newRequest.requestNumber}) was submitted successfully. Department: ${docType.department}.`,
        'success',
        newRequest.id
      );

      // Audit log
      auditService.log(
        req.user.id,
        'REQUEST_SUBMITTED',
        `Submitted application ${newRequest.requestNumber} for ${docType.name}`,
        req.ip,
        newRequest.id
      );

      // Trigger Government Gateway abstraction hook
      govService.submitApplication({
        requestNumber: newRequest.requestNumber,
        documentType: docType.name,
        applicantName: `${req.user.firstName} ${req.user.lastName}`,
        applicationData,
      }).catch((e) => console.warn('Gov service background hook notice:', e));

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          request: newRequest,
          requestNumber: newRequest.requestNumber,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getMyRequests: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { status, search } = req.query;
      let userRequests = db.requests.find((r) => r.citizen === req.user!.id);

      if (status && typeof status === 'string' && status !== 'ALL') {
        userRequests = userRequests.filter((r) => r.status === status);
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        userRequests = userRequests.filter((r) => {
          const docType = db.documentTypes.findById(r.documentType);
          return (
            r.requestNumber.toLowerCase().includes(q) ||
            (docType && docType.name.toLowerCase().includes(q))
          );
        });
      }

      // Populate documentType info & sort by newest first
      const populated = userRequests
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .map((r) => {
          const docType = db.documentTypes.findById(r.documentType);
          return {
            ...r,
            documentTypeDetails: docType || { name: 'Unknown Document', department: r.currentDepartment },
          };
        });

      return res.json({
        success: true,
        data: populated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getRequestById: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const request = db.requests.findById(id);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Application request not found.' });
      }

      // Enforce citizen ownership: citizen can only access their own request
      if (req.user.role === 'citizen' && request.citizen !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view this citizen application.',
        });
      }

      const citizen = db.users.findById(request.citizen);
      const docType = db.documentTypes.findById(request.documentType);
      const timeline = db.statusHistories.findByRequest(request.id);

      const citizenSafe = citizen ? {
        id: citizen.id,
        firstName: citizen.firstName,
        lastName: citizen.lastName,
        email: citizen.email,
        mobileNumber: citizen.mobileNumber,
        address: citizen.address,
        city: citizen.city,
        district: citizen.district,
        state: citizen.state,
        pincode: citizen.pincode,
      } : null;

      return res.json({
        success: true,
        data: {
          ...request,
          citizenDetails: citizenSafe,
          documentTypeDetails: docType,
          statusHistory: timeline,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  trackByNumber: async (req: AuthRequest, res: Response) => {
    try {
      const { requestNumber } = req.params;
      if (!requestNumber) {
        return res.status(400).json({ success: false, message: 'Request number is required' });
      }

      const request = db.requests.findByRequestNumber(requestNumber);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: `No application found matching request number "${requestNumber.toUpperCase()}". Please verify the number from your acknowledgement receipt.`,
        });
      }

      const docType = db.documentTypes.findById(request.documentType);
      const timeline = db.statusHistories.findByRequest(request.id);
      const citizen = db.users.findById(request.citizen);

      // Mask citizen name for public privacy protection
      const maskedName = citizen
        ? `${citizen.firstName[0]}*** ${citizen.lastName[0]}***`
        : 'Applicant';

      return res.json({
        success: true,
        data: {
          id: request.id,
          requestNumber: request.requestNumber,
          applicantMasked: maskedName,
          documentType: docType ? docType.name : 'Government Document',
          department: request.currentDepartment,
          status: request.status,
          submittedAt: request.submittedAt,
          lastUpdatedAt: request.lastUpdatedAt,
          expectedCompletionDate: request.expectedCompletionDate,
          remarks: request.remarks,
          assignedOfficer: request.assignedOfficer,
          timeline: timeline.map((item) => ({
            stage: item.newStatus,
            timestamp: item.timestamp,
            role: item.changedByRole,
            remarks: item.remarks,
          })),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  uploadAdditionalDocument: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const request = db.requests.findById(id);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Application request not found' });
      }

      if (req.user.role === 'citizen' && request.citizen !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized to modify this request' });
      }

      if (request.status !== 'ADDITIONAL_DOCUMENT_REQUIRED') {
        return res.status(400).json({
          success: false,
          message: `Additional documents cannot be uploaded at current stage '${request.status}'.`,
        });
      }

      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length === 0) {
        return res.status(400).json({ success: false, message: 'Please attach at least one document.' });
      }

      const newDocs: IUploadedDoc[] = files.map((file) => ({
        id: `upl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        documentType: req.body.documentTypeName || 'Requested Supplementary Document',
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
        uploadedBy: req.user!.id,
        uploadedAt: new Date().toISOString(),
        verificationStatus: 'PENDING',
        verificationRemarks: 'Uploaded in response to officer clarification request.',
      }));

      const updatedDocs = [...request.uploadedDocuments, ...newDocs];

      // Automatically return status to DOCUMENT_VERIFICATION as per workflow specs
      const oldStatus = request.status;
      const newStatus = 'DOCUMENT_VERIFICATION';

      const updated = db.requests.updateById(id, {
        uploadedDocuments: updatedDocs,
        status: newStatus,
        remarks: 'Citizen uploaded requested supplementary document(s). Ready for re-verification.',
        additionalDocPrompt: undefined,
      });

      // Record status history
      db.statusHistories.create({
        request: id,
        oldStatus,
        newStatus,
        changedBy: req.user.id,
        changedByRole: 'citizen',
        remarks: `Uploaded supplementary file: ${files.map((f) => f.originalname).join(', ')}. Returned to Document Verification.`,
      });

      // Notification
      notificationService.createNotification(
        req.user.id,
        'Supplementary Document Uploaded',
        `Your documents have been submitted for ${request.requestNumber}. The status has returned to Document Verification.`,
        'info',
        request.id
      );

      auditService.log(
        req.user.id,
        'ADDITIONAL_DOCUMENT_UPLOADED',
        `Citizen uploaded requested documents for ${request.requestNumber}`,
        req.ip,
        request.id
      );

      return res.json({
        success: true,
        message: 'Supplementary documents uploaded successfully. Application returned to verification queue.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  cancelRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const request = db.requests.findById(id);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Application request not found' });
      }

      if (request.citizen !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to cancel this request' });
      }

      // Citizen can only cancel if SUBMITTED
      if (req.user.role === 'citizen' && request.status !== 'SUBMITTED') {
        return res.status(400).json({
          success: false,
          message: `Applications can only be cancelled while in 'SUBMITTED' stage. Current stage '${request.status}' is already being processed by the department.`,
        });
      }

      const oldStatus = request.status;
      const updated = db.requests.updateById(id, {
        status: 'CANCELLED',
        remarks: req.body.reason || 'Cancelled by applicant request.',
        completedAt: new Date().toISOString(),
      });

      db.statusHistories.create({
        request: id,
        oldStatus,
        newStatus: 'CANCELLED',
        changedBy: req.user.id,
        changedByRole: req.user.role,
        remarks: req.body.reason || 'Application cancelled by user.',
      });

      notificationService.createNotification(
        request.citizen,
        'Application Cancelled',
        `Application ${request.requestNumber} was cancelled.`,
        'warning',
        request.id
      );

      auditService.log(req.user.id, 'REQUEST_CANCELLED', `Cancelled application ${request.requestNumber}`, req.ip, request.id);

      return res.json({
        success: true,
        message: 'Application has been cancelled.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  downloadDocument: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id, documentId } = req.params;
      const request = db.requests.findById(id);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      // Ownership authorization
      if (req.user.role === 'citizen' && request.citizen !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to document.' });
      }

      const doc = request.uploadedDocuments.find((d) => d.id === documentId);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document attachment not found' });
      }

      const filePath = path.join(config.uploadDir, doc.storedName);
      if (!fs.existsSync(filePath)) {
        // Fallback to sample cert if mock name
        const fallback = path.join(config.uploadDir, 'cert_gov_2026_000001.pdf');
        if (fs.existsSync(fallback)) {
          return res.download(fallback, doc.originalName);
        }
        return res.status(404).json({ success: false, message: 'Document file not found on server storage.' });
      }

      return res.download(filePath, doc.originalName);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  downloadFinalDocument: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const request = db.requests.findById(id);

      if (!request) {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      if (req.user.role === 'citizen' && request.citizen !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to certificate.' });
      }

      if (!request.finalDocument) {
        return res.status(400).json({
          success: false,
          message: 'Certificate has not been generated or issued yet for this application.',
        });
      }

      // Mark request COMPLETED when citizen downloads approved certificate
      if (request.status === 'READY_FOR_DOWNLOAD' && req.user.role === 'citizen') {
        db.requests.updateById(id, {
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        });
        db.statusHistories.create({
          request: id,
          oldStatus: 'READY_FOR_DOWNLOAD',
          newStatus: 'COMPLETED',
          changedBy: req.user.id,
          changedByRole: 'citizen',
          remarks: 'Citizen downloaded officially sanctioned digital certificate. Request lifecycle completed.',
        });
        auditService.log(
          req.user.id,
          'CERTIFICATE_DOWNLOADED_COMPLETED',
          `Citizen downloaded certificate for ${request.requestNumber}`,
          req.ip,
          request.id
        );
      }

      const filePath = path.join(config.uploadDir, request.finalDocument.storedName);
      if (!fs.existsSync(filePath)) {
        const fallback = path.join(config.uploadDir, 'cert_gov_2026_000001.pdf');
        if (fs.existsSync(fallback)) {
          return res.download(fallback, request.finalDocument.originalName);
        }
        return res.status(404).json({ success: false, message: 'Certificate file missing on server.' });
      }

      return res.download(filePath, request.finalDocument.originalName);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};

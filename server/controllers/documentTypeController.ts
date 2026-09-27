import { Response } from 'express';
import { db } from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { auditService } from '../services/auditService';

export const documentTypeController = {
  getAll: async (_req: AuthRequest, res: Response) => {
    try {
      const docTypes = db.documentTypes.find();
      return res.json({
        success: true,
        data: docTypes,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const docType = db.documentTypes.findById(id);
      if (!docType) {
        return res.status(404).json({ success: false, message: 'Document type not found' });
      }
      return res.json({
        success: true,
        data: docType,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const { name, description, department, processingTime, fee, requiredDocuments, dynamicFormFields } = req.body;
      if (!name || !department) {
        return res.status(400).json({ success: false, message: 'Name and Department are required.' });
      }

      const newDoc = db.documentTypes.create({
        name,
        description: description || '',
        department,
        processingTime: Number(processingTime) || 7,
        fee: Number(fee) || 0,
        requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : [],
        dynamicFormFields: Array.isArray(dynamicFormFields) ? dynamicFormFields : [],
        isActive: true,
      });

      auditService.log(req.user!.id, 'DOCUMENT_TYPE_CREATED', `Created document type: ${name}`, req.ip);

      return res.status(201).json({
        success: true,
        message: 'Document type created successfully',
        data: newDoc,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.documentTypes.updateById(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Document type not found' });
      }

      auditService.log(req.user!.id, 'DOCUMENT_TYPE_UPDATED', `Updated document type: ${updated.name}`, req.ip);

      return res.json({
        success: true,
        message: 'Document type updated successfully',
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  toggleStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const doc = db.documentTypes.findById(id);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document type not found' });
      }

      const updated = db.documentTypes.updateById(id, { isActive: !doc.isActive });
      auditService.log(req.user!.id, 'DOCUMENT_TYPE_STATUS_TOGGLED', `Toggled ${doc.name} active status to ${updated?.isActive}`, req.ip);

      return res.json({
        success: true,
        message: `Document type is now ${updated?.isActive ? 'Active' : 'Inactive'}`,
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};

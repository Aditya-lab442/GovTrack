import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// Enforce admin RBAC for all routes under /api/admin
router.use(authenticateJWT, requireRole('admin'));

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Request processing
router.get('/requests', adminController.getAllRequests);
router.get('/requests/:id', adminController.getRequestDetails);
router.patch('/requests/:id/status', adminController.updateRequestStatus);
router.patch('/requests/:id/documents/:documentId/verify', adminController.verifyDocument);
router.post('/requests/:id/additional-document', adminController.requestAdditionalDocument);
router.post('/requests/:id/final-document', uploadMiddleware.single('certificate'), adminController.uploadFinalDocument);

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;

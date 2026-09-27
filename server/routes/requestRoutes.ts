import { Router } from 'express';
import { requestController } from '../controllers/requestController';
import { authenticateJWT } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// Public tracking
router.get('/track/:requestNumber', requestController.trackByNumber);

// Authenticated citizen actions
router.post(
  '/',
  authenticateJWT,
  uploadMiddleware.any(),
  requestController.createRequest
);
router.get('/my', authenticateJWT, requestController.getMyRequests);
router.get('/:id', authenticateJWT, requestController.getRequestById);
router.post(
  '/:id/additional-document',
  authenticateJWT,
  uploadMiddleware.any(),
  requestController.uploadAdditionalDocument
);
router.post('/:id/cancel', authenticateJWT, requestController.cancelRequest);
router.get('/:id/documents/:documentId', authenticateJWT, requestController.downloadDocument);
router.get('/:id/certificate/download', authenticateJWT, requestController.downloadFinalDocument);

export default router;

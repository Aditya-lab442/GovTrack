import { Router } from 'express';
import { documentTypeController } from '../controllers/documentTypeController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Publicly readable
router.get('/', documentTypeController.getAll);
router.get('/:id', documentTypeController.getById);

// Admin-only management
router.post('/', authenticateJWT, requireRole('admin'), documentTypeController.create);
router.put('/:id', authenticateJWT, requireRole('admin'), documentTypeController.update);
router.patch('/:id/status', authenticateJWT, requireRole('admin'), documentTypeController.toggleStatus);

export default router;

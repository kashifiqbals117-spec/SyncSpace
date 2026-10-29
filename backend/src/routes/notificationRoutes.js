import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);

router.get('/', notificationController.getUserNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

export default router;

import { Router } from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

// Protect all upload endpoints with requireAuth
router.use(requireAuth);

// Upload and update user avatar
router.post('/avatar', uploadSingleImage('avatar'), uploadController.uploadAvatar);

// General image upload (for task attachments, markdown, etc.)
router.post('/image', uploadSingleImage('image'), uploadController.uploadImage);

export default router;

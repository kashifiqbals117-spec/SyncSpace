import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  updateTaskSchema,
  moveTaskSchema,
  createCommentSchema,
} from '../validators/taskValidator.js';

const router = Router();

router.use(requireAuth);

// My tasks
router.get('/my', taskController.getMyTasks);

// Single task CRUD
router.get('/:taskId', taskController.getTaskById);
router.patch('/:taskId', validateRequest(updateTaskSchema), taskController.updateTask);
router.patch('/:taskId/move', validateRequest(moveTaskSchema), taskController.moveTask);
router.delete('/:taskId', taskController.deleteTask);

// Task comments
router.post('/:taskId/comments', validateRequest(createCommentSchema), taskController.addComment);

export default router;

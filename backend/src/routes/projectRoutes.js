import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import * as taskController from '../controllers/taskController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireProjectMember } from '../middleware/requireWorkspaceRole.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { ROLES } from '../constants/roles.js';
import { updateProjectSchema } from '../validators/projectValidator.js';
import { createTaskSchema } from '../validators/taskValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/:projectId', requireProjectMember(ROLES.MEMBER), projectController.getProjectById);
router.patch(
  '/:projectId',
  requireProjectMember(ROLES.ADMIN),
  validateRequest(updateProjectSchema),
  projectController.updateProject
);
router.delete('/:projectId', requireProjectMember(ROLES.ADMIN), projectController.deleteProject);

// Nested Tasks under Project
router.get('/:projectId/tasks', requireProjectMember(ROLES.MEMBER), taskController.getProjectTasks);
router.post(
  '/:projectId/tasks',
  requireProjectMember(ROLES.MEMBER),
  validateRequest(createTaskSchema),
  taskController.createTask
);

export default router;

import { Router } from 'express';
import * as workspaceController from '../controllers/workspaceController.js';
import * as projectController from '../controllers/projectController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireWorkspaceRole } from '../middleware/requireWorkspaceRole.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { ROLES } from '../constants/roles.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/workspaceValidator.js';
import { createProjectSchema } from '../validators/projectValidator.js';

const router = Router();

// Protect all workspace routes with auth
router.use(requireAuth);

// Workspaces collection
router.get('/', workspaceController.getUserWorkspaces);
router.post('/', validateRequest(createWorkspaceSchema), workspaceController.createWorkspace);

// Accept invitation (doesn't require being a member yet)
router.post('/invitations/accept', workspaceController.acceptInvitation);

// Single Workspace routes with role checks
router.get('/:workspaceId', requireWorkspaceRole(ROLES.MEMBER), workspaceController.getWorkspaceById);
router.patch(
  '/:workspaceId',
  requireWorkspaceRole(ROLES.ADMIN),
  validateRequest(updateWorkspaceSchema),
  workspaceController.updateWorkspace
);
router.delete('/:workspaceId', requireWorkspaceRole(ROLES.OWNER), workspaceController.deleteWorkspace);

// Workspace Members & Invitations
router.get('/:workspaceId/members', requireWorkspaceRole(ROLES.MEMBER), workspaceController.getWorkspaceMembers);
router.post(
  '/:workspaceId/invitations',
  requireWorkspaceRole(ROLES.ADMIN),
  validateRequest(inviteMemberSchema),
  workspaceController.inviteMember
);
router.delete('/:workspaceId/members/:userId', workspaceController.removeMember);
router.patch(
  '/:workspaceId/members/:userId/role',
  requireWorkspaceRole(ROLES.OWNER),
  validateRequest(updateMemberRoleSchema),
  workspaceController.updateMemberRole
);

// Nested Projects in Workspace
router.get('/:workspaceId/projects', requireWorkspaceRole(ROLES.MEMBER), projectController.getWorkspaceProjects);
router.post(
  '/:workspaceId/projects',
  requireWorkspaceRole(ROLES.MEMBER),
  validateRequest(createProjectSchema),
  projectController.createProject
);

export default router;

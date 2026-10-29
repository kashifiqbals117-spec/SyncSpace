import prisma from '../config/prisma.js';
import { ForbiddenError, NotFoundError } from '../errors/AppError.js';
import { hasMinimumRole, ROLES } from '../constants/roles.js';

export const requireWorkspaceRole = (minimumRole = ROLES.MEMBER) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

      if (!workspaceId) {
        return next(new ForbiddenError('Workspace ID is required for authorization check.'));
      }

      // Check if user is a member of this workspace
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: req.user.id,
          },
        },
      });

      if (!membership) {
        return next(new ForbiddenError('You are not a member of this workspace.'));
      }

      if (!hasMinimumRole(membership.role, minimumRole)) {
        return next(
          new ForbiddenError(`Action requires ${minimumRole} privileges. Your role is ${membership.role}.`)
        );
      }

      // Attach membership info to request
      req.workspaceMember = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const requireProjectMember = (minimumRole = ROLES.MEMBER) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId;

      if (!projectId) {
        return next(new NotFoundError('Project ID is required.'));
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, workspaceId: true, name: true },
      });

      if (!project) {
        return next(new NotFoundError('Project not found.'));
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: project.workspaceId,
            userId: req.user.id,
          },
        },
      });

      if (!membership) {
        return next(new ForbiddenError('You do not have access to this project.'));
      }

      if (!hasMinimumRole(membership.role, minimumRole)) {
        return next(new ForbiddenError(`Action requires ${minimumRole} role.`));
      }

      req.project = project;
      req.workspaceMember = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
};

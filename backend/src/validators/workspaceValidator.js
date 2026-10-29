import { z } from 'zod';
import { ROLES } from '../constants/roles.js';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(64),
  description: z.string().max(256).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(64).optional(),
  description: z.string().max(256).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Valid email address required').toLowerCase().trim(),
  role: z.enum([ROLES.ADMIN, ROLES.MEMBER]).default(ROLES.MEMBER),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum([ROLES.OWNER, ROLES.ADMIN, ROLES.MEMBER]),
});

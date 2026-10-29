import { z } from 'zod';
import { PROJECT_STATUS } from '../constants/statuses.js';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(80),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color code').default('#6366f1'),
  status: z.nativeEnum(PROJECT_STATUS).default(PROJECT_STATUS.ACTIVE),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
  status: z.nativeEnum(PROJECT_STATUS).optional(),
});

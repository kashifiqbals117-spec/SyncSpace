import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../constants/statuses.js';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(5000).optional(),
  status: z.nativeEnum(TASK_STATUS).default(TASK_STATUS.TODO),
  priority: z.nativeEnum(TASK_PRIORITY).default(TASK_PRIORITY.MEDIUM),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  labels: z.array(z.object({
    name: z.string().min(1).max(30),
    color: z.string().default('#3b82f6'),
  })).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(TASK_STATUS).optional(),
  priority: z.nativeEnum(TASK_PRIORITY).optional(),
  position: z.number().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  labels: z.array(z.object({
    name: z.string().min(1).max(30),
    color: z.string().default('#3b82f6'),
  })).optional(),
});

export const moveTaskSchema = z.object({
  status: z.nativeEnum(TASK_STATUS),
  newPosition: z.number(),
  targetColumnTaskIds: z.array(z.string().uuid()).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
});

import prisma from '../config/prisma.js';
import { NotFoundError } from '../errors/AppError.js';
import { TASK_STATUS, NOTIFICATION_TYPE } from '../constants/statuses.js';

export const createTask = async (projectId, creatorId, data) => {
  const { labels, ...taskData } = data;

  // Calculate default position if not provided: highest position in column + 1000
  let position = taskData.position;
  if (!position) {
    const highestTask = await prisma.task.findFirst({
      where: { projectId, status: taskData.status || TASK_STATUS.TODO },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    position = highestTask ? highestTask.position + 1000.0 : 1000.0;
  }

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        ...taskData,
        projectId,
        creatorId,
        position,
        ...(taskData.status === TASK_STATUS.DONE ? { completedAt: new Date() } : {}),
        ...(labels && labels.length > 0
          ? {
              labels: {
                create: labels.map((l) => ({ name: l.name, color: l.color || '#3b82f6' })),
              },
            }
          : {}),
        activities: {
          create: [
            {
              userId: creatorId,
              type: 'CREATED',
              details: `Task created.`,
            },
          ],
        },
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: true,
        project: { select: { id: true, name: true, workspaceId: true } },
      },
    });

    // Notify assignee if assigned to someone else
    if (created.assigneeId && created.assigneeId !== creatorId) {
      await tx.notification.create({
        data: {
          userId: created.assigneeId,
          type: NOTIFICATION_TYPE.TASK_ASSIGNED,
          title: 'New Task Assigned',
          message: `${created.creator.name} assigned you to "${created.title}".`,
          link: `/projects/${projectId}?task=${created.id}`,
        },
      });
    }

    return created;
  });

  return task;
};

export const getProjectTasks = async (projectId, { status, priority, assigneeId, search }) => {
  const where = {
    projectId,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assigneeId && (assigneeId === 'unassigned' ? { assigneeId: null } : { assigneeId })),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      labels: true,
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: [
      { position: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return tasks;
};

export const getTaskById = async (taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      labels: true,
      comments: {
        include: {
          author: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      activities: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      project: {
        select: {
          id: true,
          name: true,
          workspaceId: true,
          workspace: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!task) {
    throw new NotFoundError('Task not found.');
  }

  return task;
};

export const updateTask = async (taskId, currentUserId, data) => {
  const currentTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: { creator: true },
  });

  if (!currentTask) {
    throw new NotFoundError('Task not found.');
  }

  const { labels, ...fieldsToUpdate } = data;
  const activityLogs = [];

  if (fieldsToUpdate.status && fieldsToUpdate.status !== currentTask.status) {
    activityLogs.push(`Status changed from ${currentTask.status} to ${fieldsToUpdate.status}.`);
    if (fieldsToUpdate.status === TASK_STATUS.DONE) {
      fieldsToUpdate.completedAt = new Date();
    } else {
      fieldsToUpdate.completedAt = null;
    }
  }

  if (fieldsToUpdate.priority && fieldsToUpdate.priority !== currentTask.priority) {
    activityLogs.push(`Priority changed to ${fieldsToUpdate.priority}.`);
  }

  if (fieldsToUpdate.assigneeId !== undefined && fieldsToUpdate.assigneeId !== currentTask.assigneeId) {
    activityLogs.push(fieldsToUpdate.assigneeId ? 'Assignee updated.' : 'Task unassigned.');
  }

  const updatedTask = await prisma.$transaction(async (tx) => {
    // If labels updated, delete old and insert new
    if (labels) {
      await tx.taskLabel.deleteMany({ where: { taskId } });
      await tx.taskLabel.createMany({
        data: labels.map((l) => ({ taskId, name: l.name, color: l.color || '#3b82f6' })),
      });
    }

    const task = await tx.task.update({
      where: { id: taskId },
      data: {
        ...fieldsToUpdate,
        ...(activityLogs.length > 0
          ? {
              activities: {
                create: activityLogs.map((log) => ({
                  userId: currentUserId,
                  type: 'UPDATED',
                  details: log,
                })),
              },
            }
          : {}),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: true,
        project: { select: { id: true, name: true, workspaceId: true } },
      },
    });

    // Notify new assignee if changed
    if (
      fieldsToUpdate.assigneeId &&
      fieldsToUpdate.assigneeId !== currentTask.assigneeId &&
      fieldsToUpdate.assigneeId !== currentUserId
    ) {
      await tx.notification.create({
        data: {
          userId: fieldsToUpdate.assigneeId,
          type: NOTIFICATION_TYPE.TASK_ASSIGNED,
          title: 'Task Assigned to You',
          message: `You were assigned to "${task.title}".`,
          link: `/projects/${task.projectId}?task=${task.id}`,
        },
      });
    }

    return task;
  });

  return updatedTask;
};

export const moveTask = async (taskId, currentUserId, { status, newPosition, targetColumnTaskIds }) => {
  const currentTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!currentTask) {
    throw new NotFoundError('Task not found.');
  }

  const statusChanged = currentTask.status !== status;

  const result = await prisma.$transaction(async (tx) => {
    // Update target task
    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        status,
        position: newPosition,
        ...(status === TASK_STATUS.DONE ? { completedAt: new Date() } : (statusChanged ? { completedAt: null } : {})),
        activities: {
          create: [
            {
              userId: currentUserId,
              type: 'MOVED',
              details: statusChanged
                ? `Moved from ${currentTask.status} to ${status}`
                : `Reordered within ${status}`,
            },
          ],
        },
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: true,
        project: { select: { id: true, name: true, workspaceId: true } },
      },
    });

    // If client supplied reordered sequence of tasks in column, update their positions cleanly
    if (targetColumnTaskIds && Array.isArray(targetColumnTaskIds) && targetColumnTaskIds.length > 0) {
      for (let i = 0; i < targetColumnTaskIds.length; i++) {
        const id = targetColumnTaskIds[i];
        if (id !== taskId) {
          await tx.task.update({
            where: { id },
            data: { position: (i + 1) * 1000.0 },
          });
        }
      }
    }

    return updated;
  });

  return result;
};

export const deleteTask = async (taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, project: { select: { workspaceId: true } } },
  });

  if (!task) {
    throw new NotFoundError('Task not found.');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { message: 'Task deleted successfully.', task };
};

export const addComment = async (taskId, authorId, content) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true, creator: true, assignee: true },
  });

  if (!task) {
    throw new NotFoundError('Task not found.');
  }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.taskComment.create({
      data: {
        taskId,
        authorId,
        content,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    await tx.taskActivity.create({
      data: {
        taskId,
        userId: authorId,
        type: 'COMMENT',
        details: 'Added a comment.',
      },
    });

    // Notify task assignee or creator (if not the author)
    const targets = new Set();
    if (task.assigneeId && task.assigneeId !== authorId) targets.add(task.assigneeId);
    if (task.creatorId && task.creatorId !== authorId) targets.add(task.creatorId);

    for (const targetUserId of targets) {
      await tx.notification.create({
        data: {
          userId: targetUserId,
          type: NOTIFICATION_TYPE.TASK_COMMENT,
          title: 'New Comment on Task',
          message: `${created.author.name} commented on "${task.title}".`,
          link: `/projects/${task.projectId}?task=${taskId}`,
        },
      });
    }

    return created;
  });

  return { comment, task };
};

export const getMyTasks = async (userId, { status, priority, sortBy = 'dueDate', sortOrder = 'asc' }) => {
  const where = {
    assigneeId: userId,
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
          workspace: { select: { id: true, name: true } },
        },
      },
      labels: true,
    },
    orderBy: { [sortBy]: sortOrder },
  });

  return tasks;
};

import prisma from '../config/prisma.js';
import { NotFoundError } from '../errors/AppError.js';
import { TASK_STATUS } from '../constants/statuses.js';

export const createProject = async (workspaceId, creatorId, data) => {
  const project = await prisma.project.create({
    data: {
      ...data,
      workspaceId,
      creatorId,
    },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { tasks: true } },
    },
  });

  return {
    ...project,
    progress: 0,
  };
};

export const getWorkspaceProjects = async (workspaceId, { search, status, sortBy = 'updatedAt', sortOrder = 'desc' }) => {
  const where = {
    workspaceId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const projects = await prisma.project.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      tasks: {
        select: { id: true, status: true },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { [sortBy]: sortOrder },
  });

  // Calculate real progress for each project
  return projects.map((p) => {
    const totalTasks = p.tasks.length;
    const completedTasks = p.tasks.filter((t) => t.status === TASK_STATUS.DONE).length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const { tasks, ...projectWithoutTasks } = p;
    return {
      ...projectWithoutTasks,
      totalTasks,
      completedTasks,
      progress,
    };
  });
};

export const getProjectById = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
          },
        },
      },
      tasks: {
        select: { id: true, status: true },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found.');
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.status === TASK_STATUS.DONE).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const { tasks, ...cleanProject } = project;
  return {
    ...cleanProject,
    totalTasks,
    completedTasks,
    progress,
  };
};

export const updateProject = async (projectId, data) => {
  const project = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return project;
};

export const deleteProject = async (projectId) => {
  await prisma.project.delete({
    where: { id: projectId },
  });

  return { message: 'Project deleted successfully.' };
};

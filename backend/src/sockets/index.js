import { Server } from 'socket.io';
import { socketAuthMiddleware } from './authMiddleware.js';
import { setIOInstance } from './socketEmitter.js';
import { SOCKET_EVENTS } from '../constants/events.js';
import prisma from '../config/prisma.js';

export const initSocket = (httpServer, clientOrigin) => {
  const io = new Server(httpServer, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  setIOInstance(io);

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const user = socket.user;
    // Join user room for targeted notifications
    socket.join(`user:${user.id}`);

    // Join Project room with DB authorization check
    socket.on(SOCKET_EVENTS.JOIN_PROJECT, async (data) => {
      try {
        const projectId = typeof data === 'string' ? data : data?.projectId;
        if (!projectId) return;

        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { workspaceId: true },
        });

        if (!project) return;

        // Verify membership
        const member = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: project.workspaceId,
              userId: user.id,
            },
          },
        });

        if (member) {
          socket.join(`project:${projectId}`);
        }
      } catch (err) {
        console.error('Socket join project error:', err);
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_PROJECT, (data) => {
      const projectId = typeof data === 'string' ? data : data?.projectId;
      if (projectId) {
        socket.leave(`project:${projectId}`);
      }
    });

    // Join Workspace room with DB authorization check
    socket.on(SOCKET_EVENTS.JOIN_WORKSPACE, async (data) => {
      try {
        const workspaceId = typeof data === 'string' ? data : data?.workspaceId;
        if (!workspaceId) return;

        const member = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: user.id,
            },
          },
        });

        if (member) {
          socket.join(`workspace:${workspaceId}`);
        }
      } catch (err) {
        console.error('Socket join workspace error:', err);
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_WORKSPACE, (data) => {
      const workspaceId = typeof data === 'string' ? data : data?.workspaceId;
      if (workspaceId) {
        socket.leave(`workspace:${workspaceId}`);
      }
    });

    socket.on('disconnect', () => {
      // Automatic cleanup handled by socket.io
    });
  });

  return io;
};

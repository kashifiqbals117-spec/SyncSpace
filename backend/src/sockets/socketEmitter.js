let ioInstance = null;

export const setIOInstance = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const emitToProject = (projectId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`project:${projectId}`).emit(event, data);
  }
};

export const emitToWorkspace = (workspaceId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`workspace:${workspaceId}`).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
};

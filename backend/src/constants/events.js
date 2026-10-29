export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Rooms
  JOIN_PROJECT: 'join:project',
  LEAVE_PROJECT: 'leave:project',
  JOIN_WORKSPACE: 'join:workspace',
  LEAVE_WORKSPACE: 'leave:workspace',

  // Task events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_MOVED: 'task:moved',
  TASK_DELETED: 'task:deleted',

  // Comments
  COMMENT_CREATED: 'comment:created',
  COMMENT_DELETED: 'comment:deleted',

  // Members
  MEMBER_JOINED: 'member:joined',
  MEMBER_UPDATED: 'member:updated',
  MEMBER_REMOVED: 'member:removed',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
};

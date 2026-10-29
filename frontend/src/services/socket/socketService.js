import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
  }

  connect(token = null) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(this.url, {
      withCredentials: true,
      auth: token ? { token } : undefined,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      // Socket connected
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Socket connection warning:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinProject(projectId) {
    if (this.socket?.connected && projectId) {
      this.socket.emit('join:project', { projectId });
    }
  }

  leaveProject(projectId) {
    if (this.socket?.connected && projectId) {
      this.socket.emit('leave:project', { projectId });
    }
  }

  joinWorkspace(workspaceId) {
    if (this.socket?.connected && workspaceId) {
      this.socket.emit('join:workspace', { workspaceId });
    }
  }

  leaveWorkspace(workspaceId) {
    if (this.socket?.connected && workspaceId) {
      this.socket.emit('leave:workspace', { workspaceId });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();

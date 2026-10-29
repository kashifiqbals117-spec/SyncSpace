import api from '../../lib/axios.js';

export const taskApi = {
  getByProject: (projectId, params = {}) => api.get(`/projects/${projectId}/tasks`, { params }),
  getById: (taskId) => api.get(`/tasks/${taskId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (taskId, data) => api.patch(`/tasks/${taskId}`, data),
  move: (taskId, data) => api.patch(`/tasks/${taskId}/move`, data),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
  addComment: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
  getMyTasks: (params = {}) => api.get('/tasks/my', { params }),
};

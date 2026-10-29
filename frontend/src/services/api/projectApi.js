import api from '../../lib/axios.js';

export const projectApi = {
  getAll: (workspaceId, params = {}) => api.get(`/workspaces/${workspaceId}/projects`, { params }),
  getById: (projectId) => api.get(`/projects/${projectId}`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/projects`, data),
  update: (projectId, data) => api.patch(`/projects/${projectId}`, data),
  delete: (projectId) => api.delete(`/projects/${projectId}`),
};

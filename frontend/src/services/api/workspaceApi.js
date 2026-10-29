import api from '../../lib/axios.js';

export const workspaceApi = {
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.patch(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
  getMembers: (id) => api.get(`/workspaces/${id}/members`),
  inviteMember: (id, data) => api.post(`/workspaces/${id}/invitations`, data),
  acceptInvite: (token) => api.post('/workspaces/invitations/accept', { token }),
  removeMember: (workspaceId, userId) => api.delete(`/workspaces/${workspaceId}/members/${userId}`),
  updateMemberRole: (workspaceId, userId, role) =>
    api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role }),
};

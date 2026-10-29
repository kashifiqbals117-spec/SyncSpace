import api from '../../lib/axios.js';

export const notificationApi = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};

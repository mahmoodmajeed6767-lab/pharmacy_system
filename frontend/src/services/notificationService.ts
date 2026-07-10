import api from './api';

export const notificationService = {
  list: (params?: any) => api.get('/notifications/', { params }),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  unreadCount: () => api.get('/notifications/unread-count'),
};

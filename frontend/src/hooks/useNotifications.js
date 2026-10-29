import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationApi } from '../services/api/notificationApi.js';
import { socketService } from '../services/socket/socketService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
    enabled: isAuthenticated,
    select: (res) => res.data || { notifications: [], unreadCount: 0 },
  });

  // Listen for real-time notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleNewNotification = (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast(data.message || 'You received a new notification', 'info');
    };

    socketService.on('notification:new', handleNewNotification);

    return () => {
      socketService.off('notification:new', handleNewNotification);
    };
  }, [isAuthenticated, queryClient, showToast]);

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast('All notifications marked as read', 'success');
    },
  });

  return {
    notifications: notificationsQuery.data?.notifications || [],
    unreadCount: notificationsQuery.data?.unreadCount || 0,
    isLoading: notificationsQuery.isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
  };
};

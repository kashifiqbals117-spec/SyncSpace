import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { taskApi } from '../services/api/taskApi.js';
import { socketService } from '../services/socket/socketService.js';
import { useToast } from '../contexts/ToastContext.jsx';

export const useProjectTasks = (projectId, filters = {}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => taskApi.getByProject(projectId, filters),
    enabled: !!projectId,
    select: (res) => res.data || [],
  });

  // Real-time socket events for project board
  useEffect(() => {
    if (!projectId) return;

    socketService.joinProject(projectId);

    const handleTaskCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    };

    const handleTaskUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    };

    const handleTaskMoved = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    };

    const handleTaskDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    };

    const handleCommentCreated = ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    };

    socketService.on('task:created', handleTaskCreated);
    socketService.on('task:updated', handleTaskUpdated);
    socketService.on('task:moved', handleTaskMoved);
    socketService.on('task:deleted', handleTaskDeleted);
    socketService.on('comment:created', handleCommentCreated);

    return () => {
      socketService.leaveProject(projectId);
      socketService.off('task:created', handleTaskCreated);
      socketService.off('task:updated', handleTaskUpdated);
      socketService.off('task:moved', handleTaskMoved);
      socketService.off('task:deleted', handleTaskDeleted);
      socketService.off('comment:created', handleCommentCreated);
    };
  }, [projectId, queryClient]);

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data) => taskApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      showToast('Task created successfully', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  // Optimistic Move Task mutation for Drag-and-Drop
  const moveMutation = useMutation({
    mutationFn: ({ taskId, status, newPosition, targetColumnTaskIds }) =>
      taskApi.move(taskId, { status, newPosition, targetColumnTaskIds }),
    onMutate: async ({ taskId, status, newPosition }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
      const previousTasks = queryClient.getQueryData(['tasks', projectId, filters]);

      if (previousTasks) {
        queryClient.setQueryData(['tasks', projectId, filters], (old) => {
          if (!old) return [];
          return old.map((t) => (t.id === taskId ? { ...t, status, position: newPosition } : t));
        });
      }

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId, filters], context.previousTasks);
      }
      showToast('Failed to move task. Reverting position.', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }) => taskApi.update(taskId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      showToast('Task updated', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (taskId) => taskApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      showToast('Task deleted', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    createTask: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    moveTask: moveMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
  };
};

export const useTaskDetail = (taskId) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskApi.getById(taskId),
    enabled: !!taskId,
    select: (res) => res.data,
  });

  const commentMutation = useMutation({
    mutationFn: (content) => taskApi.addComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      showToast('Comment posted', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    refetch: taskQuery.refetch,
    addComment: commentMutation.mutateAsync,
    isCommenting: commentMutation.isPending,
  };
};

export const useMyTasks = (filters = {}) => {
  return useQuery({
    queryKey: ['myTasks', filters],
    queryFn: () => taskApi.getMyTasks(filters),
    select: (res) => res.data || [],
  });
};

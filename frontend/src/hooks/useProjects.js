import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../services/api/projectApi.js';
import { useWorkspace } from '../contexts/WorkspaceContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

export const useProjects = (filters = {}) => {
  const { currentWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const workspaceId = currentWorkspace?.id;

  const projectsQuery = useQuery({
    queryKey: ['projects', workspaceId, filters],
    queryFn: () => projectApi.getAll(workspaceId, filters),
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectApi.create(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      showToast('Project created successfully!', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ projectId, data }) => projectApi.update(projectId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      showToast('Project updated.', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId) => projectApi.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      showToast('Project deleted.', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  return {
    projects: projectsQuery.data?.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    refetch: projectsQuery.refetch,
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
  };
};

export const useProjectDetail = (projectId) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getById(projectId),
    enabled: !!projectId,
    select: (res) => res.data,
  });
};

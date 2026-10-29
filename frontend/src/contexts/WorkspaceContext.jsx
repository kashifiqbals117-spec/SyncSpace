import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../services/api/workspaceApi.js';
import { useAuth } from './AuthContext.jsx';
import { socketService } from '../services/socket/socketService.js';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(() => {
    return localStorage.getItem('syncspace_active_workspace') || null;
  });

  const {
    data: workspacesResponse,
    isLoading: loadingWorkspaces,
    refetch: refetchWorkspaces,
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.getAll(),
    enabled: isAuthenticated,
  });

  const workspaces = workspacesResponse?.data || [];

  // Determine active workspace
  const currentWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0] || null;

  useEffect(() => {
    if (currentWorkspace?.id) {
      localStorage.setItem('syncspace_active_workspace', currentWorkspace.id);
      socketService.joinWorkspace(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  const selectWorkspace = (workspaceId) => {
    setCurrentWorkspaceId(workspaceId);
    localStorage.setItem('syncspace_active_workspace', workspaceId);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loadingWorkspaces,
        selectWorkspace,
        refetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

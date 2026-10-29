import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';

// Pages
import { Landing } from '../pages/Landing.jsx';
import { Login } from '../pages/auth/Login.jsx';
import { Register } from '../pages/auth/Register.jsx';
import { ForgotPassword } from '../pages/auth/ForgotPassword.jsx';
import { ResetPassword } from '../pages/auth/ResetPassword.jsx';
import { Dashboard } from '../pages/dashboard/Dashboard.jsx';
import { ProjectList } from '../pages/projects/ProjectList.jsx';
import { ProjectBoard } from '../pages/projects/ProjectBoard.jsx';
import { MyTasks } from '../pages/tasks/MyTasks.jsx';
import { WorkspaceMembers } from '../pages/workspaces/WorkspaceMembers.jsx';
import { WorkspaceSettings } from '../pages/workspaces/WorkspaceSettings.jsx';
import { ProfileSettings } from '../pages/settings/ProfileSettings.jsx';
import { AcceptInvitation } from '../pages/workspaces/AcceptInvitation.jsx';
import { NotFound } from '../pages/NotFound.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/invitations/:token" element={<AcceptInvitation />} />

      {/* Protected application routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:projectId" element={<ProjectBoard />} />
        <Route path="/tasks" element={<MyTasks />} />
        <Route path="/workspaces/:workspaceId/members" element={<WorkspaceMembers />} />
        <Route path="/workspaces/:workspaceId/settings" element={<WorkspaceSettings />} />
        <Route path="/settings" element={<ProfileSettings />} />
      </Route>

      {/* 404 handler */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

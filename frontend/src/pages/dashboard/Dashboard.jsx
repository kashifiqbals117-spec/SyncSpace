import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { useProjects } from '../../hooks/useProjects.js';
import { useMyTasks } from '../../hooks/useTasks.js';
import { Topbar } from '../../components/layout/Topbar.jsx';
import { StatCard } from '../../components/dashboard/StatCard.jsx';
import { ProjectCard } from '../../components/projects/ProjectCard.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const Dashboard = () => {
  const { onOpenMobile } = useOutletContext();
  const { currentWorkspace } = useWorkspace();
  const { projects, isLoading: loadingProjects } = useProjects();
  const { data: myTasks = [], isLoading: loadingMyTasks } = useMyTasks();

  const urgentTasks = myTasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH');
  const pendingTasks = myTasks.filter((t) => t.status !== 'DONE');

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar onOpenMobile={onOpenMobile} breadcrumbs={[{ label: 'Dashboard' }]} />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              Workspace Overview
              <Sparkles className="w-5 h-5 text-brand-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {currentWorkspace
                ? `Currently operating in ${currentWorkspace.name}`
                : 'Select or create a workspace to start collaborating'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/projects">
              <Button variant="primary" size="sm" icon={Plus}>
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Projects"
            value={projects.length}
            icon={FolderKanban}
            color="text-brand-400"
            description="Active initiatives"
          />
          <StatCard
            title="My Open Tasks"
            value={pendingTasks.length}
            icon={CheckSquare}
            color="text-emerald-400"
            description="Assigned to you"
          />
          <StatCard
            title="High Priority"
            value={urgentTasks.length}
            icon={AlertTriangle}
            color="text-rose-400"
            description="Urgent or high focus"
          />
          <StatCard
            title="Workspace Members"
            value={currentWorkspace?.memberCount || 1}
            icon={Users}
            color="text-indigo-400"
            description="Collaborating"
          />
        </div>

        {/* Recent Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-brand-400" />
              Active Projects
            </h2>
            <Link
              to="/projects"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="No projects created yet"
              description="Get started by creating your team's first project board."
              actionLabel="Create Project"
              onAction={() => {}}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Urgent Tasks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Your Priority Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              View My Tasks
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {urgentTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
              No urgent tasks pending. You are completely caught up!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {urgentTasks.slice(0, 3).map((task) => (
                <Link
                  key={task.id}
                  to={`/projects/${task.project.id}?task=${task.id}`}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 block"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{task.project.name}</span>
                    <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{task.title}</h4>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

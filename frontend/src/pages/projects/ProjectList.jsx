import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects.js';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { Topbar } from '../../components/layout/Topbar.jsx';
import { ProjectCard } from '../../components/projects/ProjectCard.jsx';
import { ProjectModal } from '../../components/projects/ProjectModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { PROJECT_STATUSES } from '../../constants/index.js';

export const ProjectList = () => {
  const { onOpenMobile } = useOutletContext();
  const { currentWorkspace } = useWorkspace();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { projects, isLoading, createProject, isCreating } = useProjects({
    search: search || undefined,
    status: status || undefined,
  });

  const handleCreate = async (data) => {
    await createProject(data);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar onOpenMobile={onOpenMobile} breadcrumbs={[{ label: 'Projects' }]} />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-brand-400" />
              Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kanban workflows and roadmaps for {currentWorkspace?.name || 'Workspace'}
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Create your first project to start tracking tasks on a Kanban board."
            actionLabel="Create Project"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />
    </div>
  );
};

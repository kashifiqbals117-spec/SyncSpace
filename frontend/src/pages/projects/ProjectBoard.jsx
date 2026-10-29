import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useOutletContext } from 'react-router-dom';
import { useProjectDetail } from '../../hooks/useProjects.js';
import { useProjectTasks } from '../../hooks/useTasks.js';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { Topbar } from '../../components/layout/Topbar.jsx';
import { KanbanBoard } from '../../components/boards/KanbanBoard.jsx';
import { TaskFilterBar } from '../../components/tasks/TaskFilterBar.jsx';
import { TaskDetailDrawer } from '../../components/tasks/TaskDetailDrawer.jsx';
import { TaskModal } from '../../components/tasks/TaskModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProjectBoard = () => {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { onOpenMobile } = useOutletContext();
  const { currentWorkspace } = useWorkspace();

  const { data: project, isLoading: loadingProject } = useProjectDetail(projectId);

  // Filter state
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState(searchParams.get('task') || null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState('TODO');

  const {
    tasks,
    isLoading: loadingTasks,
    createTask,
    moveTask,
    updateTask,
    deleteTask,
    isCreating,
  } = useProjectTasks(projectId, {
    search: search || undefined,
    priority: priority || undefined,
    assigneeId: assigneeId || undefined,
  });

  useEffect(() => {
    const taskParam = searchParams.get('task');
    if (taskParam) {
      setSelectedTaskId(taskParam);
    }
  }, [searchParams]);

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
    setSearchParams({ task: taskId });
  };

  const handleCloseDrawer = () => {
    setSelectedTaskId(null);
    setSearchParams({});
  };

  const handleQuickAdd = (status) => {
    setTaskModalDefaultStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (data) => {
    await createTask(data);
    setIsTaskModalOpen(false);
  };

  const workspaceMembers = project?.workspace?.members || [];

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <Topbar
        onOpenMobile={onOpenMobile}
        breadcrumbs={[
          { label: 'Projects', path: '/projects' },
          { label: project?.name || 'Board' },
        ]}
      />

      <div className="flex-1 flex flex-col p-4 sm:p-6 min-w-0 overflow-hidden">
        {/* Project Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: project?.color || '#6366f1' }}
              />
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {project?.name || 'Loading Project...'}
              </h1>
            </div>
            {project?.description && (
              <p className="text-xs text-slate-400 mt-1 max-w-2xl line-clamp-1">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Real progress stat */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Progress:</span>
              <span className="font-semibold text-slate-200">{project?.progress || 0}%</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => handleQuickAdd('TODO')}
            >
              Add Task
            </Button>
          </div>
        </div>

        {/* Task Filter Bar */}
        <div className="shrink-0">
          <TaskFilterBar
            search={search}
            onSearchChange={setSearch}
            priority={priority}
            onPriorityChange={setPriority}
            assigneeId={assigneeId}
            onAssigneeChange={setAssigneeId}
            members={workspaceMembers}
            onClear={() => {
              setSearch('');
              setPriority('');
              setAssigneeId('');
            }}
          />
        </div>

        {/* Kanban Board */}
        <div className="flex-1 min-h-0">
          {loadingTasks ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map((col) => (
                <div
                  key={col}
                  className="w-80 h-96 rounded-2xl bg-slate-950/40 border border-slate-800/80 animate-pulse shrink-0"
                />
              ))}
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onMoveTask={moveTask}
              onTaskClick={handleTaskClick}
              onQuickAdd={handleQuickAdd}
            />
          )}
        </div>
      </div>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={handleCloseDrawer}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        members={workspaceMembers}
      />

      {/* Quick Add Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        defaultStatus={taskModalDefaultStatus}
        members={workspaceMembers}
        isLoading={isCreating}
      />
    </div>
  );
};

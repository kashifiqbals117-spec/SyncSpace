import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useMyTasks } from '../../hooks/useTasks.js';
import { Topbar } from '../../components/layout/Topbar.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { CheckSquare, Calendar, AlertCircle, ArrowUpRight } from 'lucide-react';
import { formatDate, isOverdue } from '../../lib/utils.js';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../constants/index.js';

export const MyTasks = () => {
  const { onOpenMobile } = useOutletContext();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const { data: tasks = [], isLoading } = useMyTasks({
    status: status || undefined,
    priority: priority || undefined,
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar onOpenMobile={onOpenMobile} breadcrumbs={[{ label: 'My Tasks' }]} />

      <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-emerald-400" />
              My Tasks
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              All tasks assigned to you across projects
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              {TASK_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">All Priorities</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks Table / List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks assigned to you"
            description="You don't have any tasks matching the current filters."
          />
        ) : (
          <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            {tasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);
              const priorityMeta =
                TASK_PRIORITIES.find((p) => p.id === task.priority) || TASK_PRIORITIES[1];
              const statusMeta =
                TASK_STATUSES.find((s) => s.id === task.status) || TASK_STATUSES[1];

              return (
                <Link
                  key={task.id}
                  to={`/projects/${task.project.id}?task=${task.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-850/60 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        {task.project.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 hover:text-brand-300 transition-colors truncate">
                      {task.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityMeta.badgeClass}`}>
                      {priorityMeta.label}
                    </span>

                    {task.dueDate && (
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {overdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                        {formatDate(task.dueDate)}
                      </span>
                    )}

                    <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

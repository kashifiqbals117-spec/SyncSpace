import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { TASK_PRIORITIES } from '../../constants/index.js';

export const TaskFilterBar = ({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeChange,
  members = [],
  onClear,
}) => {
  const hasActiveFilters = search || priority || assigneeId;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 mb-4 text-xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={assigneeId}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
};

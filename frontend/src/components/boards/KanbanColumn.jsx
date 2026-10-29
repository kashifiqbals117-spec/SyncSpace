import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from '../tasks/TaskCard.jsx';
import { Plus } from 'lucide-react';

export const KanbanColumn = ({ column, tasks, onTaskClick, onQuickAdd }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 sm:w-80 shrink-0 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 transition-colors ${
        isOver ? 'ring-2 ring-brand-500/50 bg-slate-900/60' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${column.color}`}
          >
            {column.label}
          </span>
          <span className="text-xs font-semibold text-slate-400">{tasks.length}</span>
        </div>

        <button
          onClick={() => onQuickAdd(column.id)}
          className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-850 rounded-lg transition-colors"
          title={`Add task to ${column.label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[150px] pr-1">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-28 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-xs text-slate-400 select-none">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

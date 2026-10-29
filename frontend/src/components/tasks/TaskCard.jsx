import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TASK_PRIORITIES } from '../../constants/index.js';
import { Avatar } from '../common/Avatar.jsx';
import { Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDate, isOverdue } from '../../lib/utils.js';

export const TaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const priorityMeta =
    TASK_PRIORITIES.find((p) => p.id === task.priority) || TASK_PRIORITIES[1];

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group relative rounded-xl bg-slate-900 border border-slate-800 p-3.5 shadow-sm hover:border-slate-700/80 transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40 border-dashed border-brand-500 scale-[0.98]' : 'hover:-translate-y-0.5'
      }`}
    >
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {task.labels.map((label) => (
            <span
              key={label.id || label.name}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md border"
              style={{
                backgroundColor: `${label.color}15`,
                borderColor: `${label.color}40`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
        {task.title}
      </h4>

      {/* Footer Info: Priority, Due Date, Comments, Assignee */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityMeta.badgeClass}`}
          >
            {priorityMeta.label}
          </span>

          {task.dueDate && (
            <div
              className={`flex items-center gap-1 text-[11px] font-medium ${
                overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
              }`}
              title={overdue ? 'Overdue' : 'Due date'}
            >
              {overdue ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <Calendar className="w-3 h-3" />}
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}

          {task._count?.comments > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <MessageSquare className="w-3 h-3" />
              <span>{task._count.comments}</span>
            </div>
          )}
        </div>

        {task.assignee ? (
          <Avatar
            src={task.assignee.avatarUrl}
            name={task.assignee.name}
            size="xs"
          />
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-slate-700/80 flex items-center justify-center text-[10px] text-slate-400">
            ?
          </div>
        )}
      </div>
    </div>
  );
};

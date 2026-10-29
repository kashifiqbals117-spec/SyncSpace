import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge.jsx';
import { PROJECT_STATUSES } from '../../constants/index.js';
import { CheckCircle2, Clock, MoreVertical, ArrowRight } from 'lucide-react';

export const ProjectCard = ({ project, onEdit, onDelete, canManage }) => {
  const statusMeta = PROJECT_STATUSES.find((s) => s.id === project.status) || PROJECT_STATUSES[1];

  return (
    <div className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/20 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Color bar top accent */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: project.color || '#6366f1' }}
        />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Link
              to={`/projects/${project.id}`}
              className="text-base font-semibold text-slate-100 hover:text-brand-400 transition-colors line-clamp-1"
            >
              {project.name}
            </Link>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-700/50 ${statusMeta.color}`}
            >
              {statusMeta.label}
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-4">
            {project.description || 'No description provided.'}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Progress
              </span>
              <span className="font-semibold text-slate-200">{project.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>
          {project.completedTasks} / {project.totalTasks} tasks completed
        </span>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Open Board
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

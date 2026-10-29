import React from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { NotificationDropdown } from '../notifications/NotificationDropdown.jsx';
import { Link } from 'react-router-dom';

export const Topbar = ({ onOpenMobile, title, breadcrumbs = [] }) => {
  const { currentWorkspace } = useWorkspace();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center text-xs text-slate-400 font-medium">
          {currentWorkspace && (
            <span className="text-slate-300 font-semibold truncate max-w-[150px]">
              {currentWorkspace.name}
            </span>
          )}

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 shrink-0" />
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-slate-200 transition-colors truncate max-w-[140px]">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-200 font-medium truncate max-w-[140px]">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
      </div>
    </header>
  );
};

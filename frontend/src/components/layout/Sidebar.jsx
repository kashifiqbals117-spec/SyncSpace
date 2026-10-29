import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { Avatar } from '../common/Avatar.jsx';
import { WorkspaceModal } from '../workspaces/WorkspaceModal.jsx';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Settings,
  ChevronDown,
  Plus,
  LogOut,
  Moon,
  Sun,
  Layers,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { workspaces, currentWorkspace, selectWorkspace } = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { label: 'Projects', icon: FolderKanban, path: '/projects' },
    {
      label: 'Members',
      icon: Users,
      path: currentWorkspace ? `/workspaces/${currentWorkspace.id}/members` : '/workspaces',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: currentWorkspace ? `/workspaces/${currentWorkspace.id}/settings` : '/settings',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand / Header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800/80">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-950/50">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                SyncSpace
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Pro
                </span>
              </span>
              <p className="text-[11px] text-slate-400 leading-none">Your team. Shared.</p>
            </div>
          </NavLink>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 border-b border-slate-800/60 relative">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 block mb-1">
            Workspace
          </label>
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                {currentWorkspace?.name ? currentWorkspace.name[0].toUpperCase() : 'W'}
              </div>
              <span className="text-sm font-medium text-slate-200 truncate">
                {currentWorkspace?.name || 'Select Workspace'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {isWorkspaceMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsWorkspaceMenuOpen(false)}
              />
              <div className="absolute left-3 right-3 top-full mt-1 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1 z-20">
                <div className="max-h-48 overflow-y-auto py-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        selectWorkspace(ws.id);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                        currentWorkspace?.id === ws.id
                          ? 'bg-brand-600/20 text-brand-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      <span className="text-[10px] uppercase text-slate-400 ml-2">
                        {ws.role}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-1 mt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      setIsCreateWorkspaceOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-brand-400 hover:bg-slate-800 rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Workspace
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User Profile & Theme switcher */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] text-slate-400 font-medium">Appearance</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <NavLink
              to="/settings"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
            >
              <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Create Workspace Modal */}
      <WorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />
    </>
  );
};

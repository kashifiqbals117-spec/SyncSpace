import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { workspaceApi } from '../../services/api/workspaceApi.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Topbar } from '../../components/layout/Topbar.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { Settings, Trash2, AlertTriangle } from 'lucide-react';

export const WorkspaceSettings = () => {
  const { onOpenMobile } = useOutletContext();
  const { currentWorkspace, refetchWorkspaces } = useWorkspace();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name || '');
      setDescription(currentWorkspace.description || '');
    }
  }, [currentWorkspace]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    try {
      await workspaceApi.update(currentWorkspace.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      await refetchWorkspaces();
      showToast('Workspace settings saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update workspace', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await workspaceApi.delete(currentWorkspace.id);
      showToast('Workspace deleted permanently', 'success');
      await refetchWorkspaces();
      setIsConfirmDeleteOpen(false);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to delete workspace', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = currentWorkspace?.role === 'OWNER';

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar onOpenMobile={onOpenMobile} breadcrumbs={[{ label: 'Workspace Settings' }]} />

      <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-400" />
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage general configuration and preferences for {currentWorkspace?.name}
          </p>
        </div>

        {/* General Settings Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <h3 className="text-sm font-semibold text-slate-200">General Information</h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Workspace Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" size="sm" type="submit" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Danger Zone (Owner Only) */}
        {isOwner && (
          <div className="rounded-2xl bg-rose-950/20 border border-rose-500/20 p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Zone</span>
            </div>
            <p className="text-xs text-slate-300">
              Permanently delete this workspace, including all of its projects, tasks, comments, and member associations. This action is irreversible.
            </p>

            <div className="pt-2">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setIsConfirmDeleteOpen(true)}
              >
                Delete Workspace
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Workspace Permanently"
        message="Are you completely sure you want to delete this workspace? All associated projects and tasks will be erased."
        isLoading={isDeleting}
      />
    </div>
  );
};

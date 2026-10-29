import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { workspaceApi } from '../../services/api/workspaceApi.js';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';

export const WorkspaceModal = ({ isOpen, onClose, initialData = null }) => {
  const { refetchWorkspaces, selectWorkspace } = useWorkspace();
  const { showToast } = useToast();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (initialData?.id) {
        await workspaceApi.update(initialData.id, { name, description });
        showToast('Workspace updated successfully', 'success');
      } else {
        const response = await workspaceApi.create({ name, description });
        showToast('Workspace created successfully', 'success');
        selectWorkspace(response.data.id);
      }
      await refetchWorkspaces();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Workspace' : 'Create New Workspace'}
      description={
        initialData
          ? 'Update your workspace profile and details.'
          : 'Create a space for your team, projects, and tasks.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Workspace Name"
          placeholder="e.g. Acme Studio, Product Lab"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Description (Optional)</label>
          <textarea
            rows={3}
            placeholder="What is this workspace used for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Workspace'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

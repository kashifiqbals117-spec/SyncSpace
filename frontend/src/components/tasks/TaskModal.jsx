import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../constants/index.js';

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  defaultStatus = 'TODO',
  members = [],
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labelName, setLabelName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      labels: labelName.trim() ? [{ name: labelName.trim(), color: '#6366f1' }] : undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus(defaultStatus);
    setPriority('MEDIUM');
    setAssigneeId('');
    setDueDate('');
    setLabelName('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g. Design authentication workflow"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Description</label>
          <textarea
            rows={3}
            placeholder="Provide context, acceptance criteria, or links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Optional Tag */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Tag / Label (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Design, Frontend, Urgent"
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

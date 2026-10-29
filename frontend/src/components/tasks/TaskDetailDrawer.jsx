import React, { useState, useEffect } from 'react';
import { useTaskDetail } from '../../hooks/useTasks.js';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../constants/index.js';
import { Avatar } from '../common/Avatar.jsx';
import { Button } from '../ui/Button.jsx';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import {
  X,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export const TaskDetailDrawer = ({
  taskId,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  members = [],
}) => {
  const { task, isLoading, addComment, isCommenting } = useTaskDetail(taskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [labels, setLabels] = useState([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'TODO');
      setPriority(task.priority || 'MEDIUM');
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '');
      setLabels(task.labels || []);
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSaveField = async (fields) => {
    if (!taskId) return;
    await onUpdateTask({ taskId, data: fields });
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(newComment.trim());
    setNewComment('');
  };

  const handleAddLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const updated = [...labels, { name: newLabelName.trim(), color: '#6366f1' }];
    setLabels(updated);
    setNewLabelName('');
    await handleSaveField({ labels: updated });
  };

  const handleRemoveLabel = async (labelName) => {
    const updated = labels.filter((l) => l.name !== labelName);
    setLabels(updated);
    await handleSaveField({ labels: updated });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Slide-out Drawer */}
        <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                Task Details
              </span>
              {task?.project && (
                <span className="text-xs text-slate-400">in {task.project.name}</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors ml-1"
                aria-label="Close task drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          {isLoading && !task ? (
            <div className="p-6 text-sm text-slate-400">Loading task details...</div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title input */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => {
                    if (title.trim() && title !== task.title) {
                      handleSaveField({ title: title.trim() });
                    }
                  }}
                  className="w-full text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-700 focus:border-brand-500 text-slate-100 focus:outline-none py-1 transition-colors"
                  placeholder="Task title"
                />
              </div>

              {/* Meta Grid: Status, Priority, Assignee, Due Date */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                {/* Status */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Status</span>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      handleSaveField({ status: e.target.value });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Priority</span>
                  <select
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value);
                      handleSaveField({ priority: e.target.value });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Assignee</span>
                  <select
                    value={assigneeId}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      setAssigneeId(val || '');
                      handleSaveField({ assigneeId: val });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Due Date</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      const dateVal = e.target.value ? new Date(e.target.value).toISOString() : null;
                      setDueDate(e.target.value);
                      handleSaveField({ dueDate: dateVal });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Labels Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Labels
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {labels.map((l) => (
                    <span
                      key={l.id || l.name}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5"
                    >
                      {l.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(l.name)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <form onSubmit={handleAddLabel} className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="+ Add label"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      className="text-xs bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 w-24"
                    />
                  </form>
                </div>
              </div>

              {/* Description textarea */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Description</span>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => {
                    if (description !== (task.description || '')) {
                      handleSaveField({ description });
                    }
                  }}
                  placeholder="Add detailed task instructions, markdown notes, or checklist..."
                  className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Comments Thread */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <MessageSquare className="w-4 h-4 text-brand-400" />
                  <span>Discussion ({task.comments?.length || 0})</span>
                </div>

                <div className="space-y-3">
                  {task.comments?.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar src={c.author?.avatarUrl} name={c.author?.name} size="xs" />
                          <span className="text-xs font-semibold text-slate-200">
                            {c.author?.name || 'User'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap pl-7">{c.content}</p>
                    </div>
                  ))}

                  {(!task.comments || task.comments.length === 0) && (
                    <p className="text-xs text-slate-400 py-2">
                      No comments yet. Start the conversation below.
                    </p>
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment..."
                    className="flex-1 text-xs rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                  <Button variant="primary" size="sm" type="submit" isLoading={isCommenting}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>

              {/* Activity History */}
              {task.activities && task.activities.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Activity History
                  </span>
                  <div className="space-y-2 text-[11px] text-slate-400">
                    {task.activities.map((a) => (
                      <div key={a.id} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-medium text-slate-300">{a.user?.name || 'Someone'}</span>{' '}
                          {a.details}{' '}
                          <span className="text-slate-400 text-[10px]">({formatDate(a.createdAt)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={async () => {
          await onDeleteTask(taskId);
          setIsConfirmDeleteOpen(false);
          onClose();
        }}
        title="Delete Task"
        message="Are you sure you want to delete this task? All comments and activity logs will be permanently deleted."
      />
    </>
  );
};

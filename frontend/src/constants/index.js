export const TASK_STATUSES = [
  { id: 'BACKLOG', label: 'Backlog', color: 'bg-slate-500/10 text-slate-400 border-slate-700/50' },
  { id: 'TODO', label: 'To Do', color: 'bg-blue-500/10 text-blue-400 border-blue-700/50' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-500/10 text-amber-400 border-amber-700/50' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-500/10 text-purple-400 border-purple-700/50' },
  { id: 'DONE', label: 'Done', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-700/50' },
];

export const TASK_PRIORITIES = [
  { id: 'LOW', label: 'Low', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' },
  { id: 'MEDIUM', label: 'Medium', badgeClass: 'bg-blue-950/60 text-blue-300 border-blue-800/60' },
  { id: 'HIGH', label: 'High', badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800/60' },
  { id: 'URGENT', label: 'Urgent', badgeClass: 'bg-rose-950/60 text-rose-300 border-rose-800/60' },
];

export const PROJECT_STATUSES = [
  { id: 'PLANNING', label: 'Planning', color: 'text-amber-400 bg-amber-500/10' },
  { id: 'ACTIVE', label: 'Active', color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'ON_HOLD', label: 'On Hold', color: 'text-purple-400 bg-purple-500/10' },
  { id: 'COMPLETED', label: 'Completed', color: 'text-blue-400 bg-blue-500/10' },
  { id: 'ARCHIVED', label: 'Archived', color: 'text-slate-400 bg-slate-500/10' },
];

export const WORKSPACE_ROLES = [
  { id: 'OWNER', label: 'Owner' },
  { id: 'ADMIN', label: 'Admin' },
  { id: 'MEMBER', label: 'Member' },
];

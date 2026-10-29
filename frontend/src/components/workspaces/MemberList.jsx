import React from 'react';
import { Avatar } from '../common/Avatar.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { UserX, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export const MemberList = ({
  members,
  currentUserId,
  userRole,
  onRemoveMember,
  onUpdateRole,
}) => {
  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN' || isOwner;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/60 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
          <tr>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
            {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {members.map((m) => {
            const isSelf = m.user.id === currentUserId;
            const isMemberOwner = m.role === 'OWNER';

            return (
              <tr key={m.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={m.user.avatarUrl} name={m.user.name} size="sm" />
                    <div>
                      <div className="font-medium text-slate-200 flex items-center gap-2">
                        {m.user.name}
                        {isSelf && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{m.user.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  {isOwner && !isSelf && !isMemberOwner ? (
                    <select
                      value={m.role}
                      onChange={(e) => onUpdateRole(m.user.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="OWNER">TRANSFER OWNER</option>
                    </select>
                  ) : (
                    <Badge
                      variant={
                        m.role === 'OWNER'
                          ? 'primary'
                          : m.role === 'ADMIN'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {m.role}
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-slate-400">
                  {formatDate(m.joinedAt)}
                </td>

                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {!isMemberOwner && (!isSelf || isOwner) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMember(m.user.id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title={isSelf ? 'Leave Workspace' : 'Remove Member'}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

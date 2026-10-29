import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../services/api/workspaceApi.js';
import { Topbar } from '../../components/layout/Topbar.jsx';
import { MemberList } from '../../components/workspaces/MemberList.jsx';
import { InviteMemberModal } from '../../components/workspaces/InviteMemberModal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Users, UserPlus } from 'lucide-react';

export const WorkspaceMembers = () => {
  const { onOpenMobile } = useOutletContext();
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const workspaceId = currentWorkspace?.id;

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['workspaceMembers', workspaceId],
    queryFn: async () => {
      const res = await workspaceApi.getMembers(workspaceId);
      return res.data || [];
    },
    enabled: !!workspaceId,
  });

  const removeMutation = useMutation({
    mutationFn: (targetUserId) => workspaceApi.removeMember(workspaceId, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      showToast('Member removed from workspace', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ targetUserId, role }) =>
      workspaceApi.updateMemberRole(workspaceId, targetUserId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
      showToast('Member role updated', 'success');
    },
    onError: (err) => {
      showToast(err.message, 'error');
    },
  });

  const currentMember = members.find((m) => m.userId === user?.id);
  const userRole = currentMember?.role || 'MEMBER';
  const canInvite = userRole === 'OWNER' || userRole === 'ADMIN';

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Topbar onOpenMobile={onOpenMobile} breadcrumbs={[{ label: 'Team Members' }]} />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-400" />
              Workspace Members
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Collaborate and manage access permissions for {currentWorkspace?.name}
            </p>
          </div>

          {canInvite && (
            <Button
              variant="primary"
              size="md"
              icon={UserPlus}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Member
            </Button>
          )}
        </div>

        {/* Member Table Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-6 text-xs text-slate-400">Loading members...</div>
          ) : (
            <MemberList
              members={members}
              currentUserId={user?.id}
              userRole={userRole}
              onRemoveMember={(id) => removeMutation.mutate(id)}
              onUpdateRole={(id, role) => updateRoleMutation.mutate({ targetUserId: id, role })}
            />
          )}
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspaceId}
        onInvited={() => {
          queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
        }}
      />
    </div>
  );
};

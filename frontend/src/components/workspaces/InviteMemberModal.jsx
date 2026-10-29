import React, { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { workspaceApi } from '../../services/api/workspaceApi.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Copy, Check, Mail } from 'lucide-react';

export const InviteMemberModal = ({ isOpen, onClose, workspaceId, onInvited }) => {
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await workspaceApi.inviteMember(workspaceId, { email, role });
      const token = response.data.invitationToken;
      const fullUrl = `${window.location.origin}/invitations/${token}`;
      setInvitationLink(fullUrl);
      showToast('Invitation generated successfully!', 'success');
      if (onInvited) onInvited();
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Invitation link copied to clipboard', 'info');
  };

  const handleReset = () => {
    setEmail('');
    setInvitationLink('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Invite Team Member"
      description="Invite collaborators to your workspace to assign tasks and build together."
    >
      {invitationLink ? (
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
            Invitation ready! Share this invitation link with your teammate to join:
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={invitationLink}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 select-all"
            />
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex justify-end pt-3">
            <Button variant="primary" size="sm" onClick={handleReset}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="collaborator@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            error={error}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="MEMBER">Member (Can edit tasks and view projects)</option>
              <option value="ADMIN">Admin (Can manage projects and members)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={handleReset} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
              Generate Invitation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

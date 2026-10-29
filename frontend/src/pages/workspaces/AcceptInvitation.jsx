import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workspaceApi } from '../../services/api/workspaceApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { refetchWorkspaces, selectWorkspace } = useWorkspace();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await workspaceApi.acceptInvite(token);
      showToast(response.message || 'Invitation accepted!', 'success');
      await refetchWorkspaces();
      if (response.workspaceId) {
        selectWorkspace(response.workspaceId);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center space-y-6">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">Workspace Invitation</h2>
          <p className="text-xs text-slate-400 mt-1">
            You have been invited to collaborate in SyncSpace.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              Logged in as <span className="font-semibold text-white">{user?.email}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleAccept}
              isLoading={isLoading}
            >
              Accept Invitation & Join
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Please sign in or create an account to accept this invitation.
            </p>
            <Link to="/login" state={{ from: { pathname: `/invitations/${token}` } }}>
              <Button variant="primary" size="lg" className="w-full">
                Sign In to Accept
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api/authApi.js';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Layers, Mail, ArrowLeft, ExternalLink } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    setMessage('');
    setDevResetUrl('');

    try {
      const response = await authApi.forgotPassword({ email });
      setMessage(response.message || 'If an account exists, a reset link was generated.');
      if (response.data?.devResetUrl) {
        setDevResetUrl(response.data.devResetUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-950/50">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">SyncSpace</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100 mt-6 tracking-tight">Reset your password</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your account email to receive a password reset token.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl shadow-black/40 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium space-y-2">
              <p>{message}</p>
              {devResetUrl && (
                <div className="pt-2 border-t border-emerald-500/20">
                  <span className="text-[11px] block font-semibold text-emerald-400">
                    [Development Mode Token Generated]:
                  </span>
                  <Link
                    to={devResetUrl}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 underline font-semibold mt-1"
                  >
                    Click here to complete password reset
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              icon={Mail}
              placeholder="alex@syncspace.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Send Reset Instructions
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

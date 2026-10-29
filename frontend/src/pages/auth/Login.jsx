import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Layers, Mail, Lock, Sparkles, UserCheck } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login({ email, password });
      showToast('Welcome back to SyncSpace!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-950/50">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">SyncSpace</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100 mt-6 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-400 mt-1">Your team. One shared space.</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl shadow-black/40 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="alex@syncspace.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>One-Click Demo Personas:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('alex@syncspace.dev')}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500/50 text-[11px] text-slate-300 transition-colors truncate"
              >
                Alex (Owner)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('elena@syncspace.dev')}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500/50 text-[11px] text-slate-300 transition-colors truncate"
              >
                Elena (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('david@syncspace.dev')}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500/50 text-[11px] text-slate-300 transition-colors truncate"
              >
                David (Dev)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

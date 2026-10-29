import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import {
  Layers,
  Kanban,
  Zap,
  Users2,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation header */}
      <header className="h-16 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-950/40">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">SyncSpace</span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 py-20 sm:py-28 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Real-Time Collaborative Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Your team. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-brand-500">One shared space.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
            Organize multi-tenant workspaces, prioritize roadmaps with interactive Kanban boards, and synchronize updates instantaneously with PostgreSQL reliability and WebSockets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link to="/register">
              <Button variant="primary" size="lg" className="shadow-lg shadow-brand-900/40">
                Launch Workspace
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In to Demo
              </Button>
            </Link>
          </div>

          {/* Quick Demo Preview Box */}
          <div className="mt-14 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 text-left overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-400 ml-2">syncspace.dev/board/preview</span>
              </div>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Socket.IO Connected
              </span>
            </div>

            {/* Kanban Preview Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>To Do</span>
                  <span className="text-slate-400">2</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs space-y-1.5">
                  <span className="text-[10px] font-semibold text-brand-300 bg-brand-500/10 px-1.5 py-0.5 rounded">Design</span>
                  <p className="font-medium text-slate-200">Interactive Kanban architecture</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-amber-400">
                  <span>In Progress</span>
                  <span className="text-slate-400">1</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-brand-500/40 text-xs space-y-1.5 shadow-lg shadow-brand-950/50">
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">Real-time</span>
                  <p className="font-medium text-slate-200">Multi-user drag-and-drop sync</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-emerald-400">
                  <span>Done</span>
                  <span className="text-slate-400">4</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs space-y-1.5 opacity-80">
                  <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">Security</span>
                  <p className="font-medium text-slate-200">PostgreSQL transactions & JWT auth</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-800/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Fluid Kanban Boards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reorder cards seamlessly with fractional positions, responsive touch support, and transactional persistence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Real-Time WebSocket Sync</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Edits, moves, and comments broadcast instantaneously to room subscribers without manual page reloading.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Enterprise Role Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Owner, Admin, and Member permissions enforced strictly at the database query level on every endpoint.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-400">
        <p>© 2026 SyncSpace. Production-grade real-time collaborative workspace.</p>
      </footer>
    </div>
  );
};

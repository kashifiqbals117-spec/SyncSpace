import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Home, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-center selection:bg-brand-500 selection:text-white">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 mb-6 shadow-xl">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-slate-200 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-8">
        The workspace resource, project, or screen you are looking for does not exist or has been relocated.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" size="md" icon={Home}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

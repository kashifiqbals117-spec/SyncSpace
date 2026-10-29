import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'text-brand-400', description }) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-100 mt-1">{value}</h3>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

import React from 'react';
import { cn } from '../../lib/utils.js';

export const Input = React.forwardRef(
  ({ className, type = 'text', label, error, helperText, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-slate-500 pointer-events-none flex items-center">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500',
              'transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
              'disabled:opacity-50 disabled:bg-slate-950',
              Icon && 'pl-9',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

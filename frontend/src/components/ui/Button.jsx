import React from 'react';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      icon: Icon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-brand-600 text-white hover:bg-brand-500 shadow-sm shadow-brand-900/30 border border-brand-500/30',
      secondary:
        'bg-slate-800 text-slate-100 hover:bg-slate-700/80 border border-slate-700/70',
      outline:
        'border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white',
      ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
      danger:
        'bg-rose-600/90 text-white hover:bg-rose-500 shadow-sm shadow-rose-950/40 border border-rose-500/30',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2.5',
      icon: 'h-8 w-8 p-0',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : Icon ? (
          <Icon className="w-4 h-4 shrink-0" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

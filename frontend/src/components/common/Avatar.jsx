import React from 'react';
import { cn, getInitials } from '../../lib/utils.js';

export const Avatar = ({ src, name = 'User', size = 'md', className, status }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-base',
  };

  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover border border-slate-700 bg-slate-800',
            sizes[size],
            className
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-semibold flex items-center justify-center border border-brand-400/30 select-none shadow-sm',
            sizes[size],
            className
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-slate-900',
            size === 'sm' || size === 'xs' ? 'w-2 h-2' : 'w-2.5 h-2.5',
            status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
          )}
        />
      )}
    </div>
  );
};

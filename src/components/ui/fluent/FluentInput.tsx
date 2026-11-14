'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FluentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  error?: string | null;
  rightElement?: React.ReactNode;
}

/**
 * Reusable Fluent UI Input Field
 * Features acrylic frosted background, smooth focus highlight,
 * optional icon slots, password eye toggle, and animated error messaging.
 */
export const FluentInput = React.forwardRef<HTMLInputElement, FluentInputProps>(
  ({ className, label, icon, isPassword = false, type = 'text', error, rightElement, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full py-2.5 text-xs sm:text-sm rounded-2xl border transition-all duration-200 outline-none',
              'bg-white/75 dark:bg-[#12151d]/75 backdrop-blur-md text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500',
              icon ? 'pl-10' : 'pl-3.5',
              isPassword || rightElement ? 'pr-10' : 'pr-3.5',
              error
                ? 'border-red-500 dark:border-red-500/80 focus:ring-2 focus:ring-red-500/30'
                : 'border-neutral-200/80 dark:border-neutral-800/90 focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/25 hover:border-neutral-300 dark:hover:border-neutral-700',
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer transition-colors active:scale-90"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightElement && <div className="absolute right-3.5 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 font-medium animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FluentInput.displayName = 'FluentInput';

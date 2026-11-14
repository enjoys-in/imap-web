'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FluentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

/**
 * Reusable Fluent UI Button Component
 * Supports micro-interaction click animations (active:scale-[0.96]),
 * smooth transitions, hover elevations, and loading spinners.
 */
export const FluentButton = React.forwardRef<HTMLButtonElement, FluentButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      icon,
      iconRight,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'relative font-bold uppercase tracking-wider select-none inline-flex items-center justify-center gap-2 rounded-full cursor-pointer transition-all duration-200 ease-out active:scale-[0.96] active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900';

    const sizeClasses = {
      sm: 'py-2 px-4 text-[11px]',
      md: 'py-3.5 px-6 text-xs',
      lg: 'py-4 px-8 text-sm',
    };

    const variantClasses = {
      primary:
        'bg-[#181b24] hover:bg-[#282e3d] dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 shadow-md hover:shadow-xl hover:shadow-black/15 dark:hover:shadow-white/10 border border-white/10 dark:border-transparent',
      secondary:
        'bg-neutral-100/90 hover:bg-neutral-200/90 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-800 dark:text-white border border-neutral-200/60 dark:border-white/10 backdrop-blur-md shadow-xs hover:shadow-md',
      accent:
        'bg-gradient-to-r from-[#0078d4] to-[#0062b1] hover:from-[#106ebe] hover:to-[#005a9e] text-white shadow-md hover:shadow-lg hover:shadow-blue-500/25 border border-blue-400/30',
      subtle:
        'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

FluentButton.displayName = 'FluentButton';

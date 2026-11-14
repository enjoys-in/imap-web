'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FluentBadgeProps {
  icon?: React.ReactNode;
  label: string;
  sub?: string;
  variant?: 'info' | 'success' | 'warning';
  trailing?: React.ReactNode;
  className?: string;
}

/**
 * Reusable Fluent UI Status Badge / Chip
 */
export function FluentBadge({ icon, label, sub, variant = 'info', trailing, className }: FluentBadgeProps) {
  const variantStyles = {
    info: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/60 text-blue-900 dark:text-blue-300',
    success: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300',
    warning: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-300',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 p-3 rounded-2xl border text-xs backdrop-blur-md transition-all duration-200 animate-in fade-in duration-200',
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="flex-1">
        <span className="font-semibold block">{label}</span>
        {sub && <span className="opacity-75 block text-[11px] mt-0.5">{sub}</span>}
      </div>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </div>
  );
}

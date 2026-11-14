'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FluentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Reusable Fluent UI Acrylic Glass Card Component
 * Designed with 32px curvature, specular top rim highlight, dual drop shadow,
 * and high-transparency frosted glass backdrop blur.
 */
export function FluentCard({ className, children, ...props }: FluentCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-[32px] p-7 sm:p-9',
        'bg-white/85 dark:bg-[#151923]/85 backdrop-blur-3xl',
        'border border-white/70 dark:border-white/10',
        'shadow-[0_24px_70px_rgba(0,0,0,0.18)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.65)]',
        'transition-all duration-300 ease-out',
        className
      )}
      {...props}
    >
      {/* Specular Top Rim Highlight */}
      <div
        className="absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

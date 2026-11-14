'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface FluentViewTransitionProps {
  viewKey: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Animated View Wrapper with smooth Fluent fade-and-slide keyframe transitions.
 */
export function FluentViewTransition({
  viewKey,
  children,
  className,
}: FluentViewTransitionProps) {
  return (
    <div
      key={viewKey}
      className={cn(
        'w-full animate-fluent-enter select-none',
        className
      )}
    >
      {children}
    </div>
  );
}

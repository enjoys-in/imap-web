import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Fluent UI Shimmering Skeleton Component
 * Features smooth Windows 11 highlight sheen with adaptive light/dark backgrounds.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-neutral-200/70 dark:bg-neutral-800/70',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[progress_1.8s_ease-in-out_infinite]',
        'after:bg-gradient-to-r after:from-transparent after:via-white/35 dark:after:via-white/10 after:to-transparent',
        className
      )}
      {...props}
    />
  );
}

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function OutlookAppSkeleton() {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Folder sidebar skeleton */}
      <div className="w-56 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-3 shrink-0">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </div>

      {/* Mail list skeleton */}
      <div className="w-80 md:w-96 border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-3 shrink-0 bg-white dark:bg-neutral-900">
        <Skeleton className="h-8 w-full" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Reading pane skeleton */}
      <div className="flex-1 p-6 space-y-4 bg-white dark:bg-neutral-900">
        <Skeleton className="h-8 w-1/2" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-2 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

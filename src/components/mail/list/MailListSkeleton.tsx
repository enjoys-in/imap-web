import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function MailListSkeleton() {
  return (
    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

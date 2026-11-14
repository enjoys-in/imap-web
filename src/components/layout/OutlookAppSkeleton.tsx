import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Fluent UI Outlook Application Shell Skeleton
 * Used during route transitions and component hydration.
 */
export function OutlookAppSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-950 font-sans select-none">
      {/* ──────────────── Top Fluent Ribbon Header ──────────────── */}
      <header className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Waffle App Launcher */}
          <div className="grid grid-cols-3 gap-0.5 w-4 h-4 p-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
            ))}
          </div>
          <Skeleton className="h-5 w-20 rounded" />
        </div>

        {/* Global Search Capsule */}
        <div className="flex-1 max-w-md mx-6">
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>

        {/* Action Controls & User Avatar */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded-md hidden sm:block" />
          <Skeleton className="w-6 h-6 rounded-md hidden sm:block" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </header>

      {/* ──────────────── Main Workspace Layout ──────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left App Switcher Rail */}
        <div className="w-12 bg-neutral-100 dark:bg-[#141414] border-r border-neutral-200 dark:border-neutral-800 flex flex-col items-center py-3 gap-3 shrink-0">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
          <div className="mt-auto">
            <Skeleton className="w-7 h-7 rounded-lg" />
          </div>
        </div>

        {/* Folder Sidebar */}
        <div className="w-56 bg-neutral-50 dark:bg-[#1b1b1b] border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-3 shrink-0 hidden md:flex md:flex-col">
          {/* New Mail Button */}
          <Skeleton className="h-9 w-full rounded-lg" />

          {/* Folder Hierarchy */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-full rounded" />
            <Skeleton className="h-6 w-full rounded" />
            <Skeleton className="h-6 w-4/5 rounded" />
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-6 w-5/6 rounded" />
          </div>
        </div>

        {/* Mail List Pane */}
        <div className="w-80 md:w-96 border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-3 shrink-0 bg-white dark:bg-[#1e1e1e] flex flex-col">
          {/* Filter & Sort Bar */}
          <div className="flex items-center justify-between pb-1">
            <Skeleton className="h-6 w-28 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>

          {/* Message Row Skeletons */}
          <div className="space-y-2.5 flex-1 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Reading Pane */}
        <div className="flex-1 p-6 space-y-5 bg-white dark:bg-[#1a1a1a] hidden lg:flex lg:flex-col overflow-hidden">
          {/* Action Toolbar */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-7 w-20 rounded" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>

          {/* Subject Line */}
          <Skeleton className="h-7 w-2/3" />

          {/* Sender Header */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>

          {/* Email Body */}
          <div className="space-y-2.5 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <div className="pt-4 space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

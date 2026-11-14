'use client';

import React from 'react';
import { Minus, Maximize2, Minimize2, X } from 'lucide-react';
import { useComposeStore } from '@/stores';

interface ComposeHeaderProps {
  title: string;
}

export function ComposeHeader({ title }: ComposeHeaderProps) {
  const isMinimized = useComposeStore((s) => s.isMinimized);
  const isMaximized = useComposeStore((s) => s.isMaximized);
  const toggleMinimize = useComposeStore((s) => s.toggleMinimize);
  const toggleMaximize = useComposeStore((s) => s.toggleMaximize);
  const close = useComposeStore((s) => s.close);
  const draftStatus = useComposeStore((s) => s.draftStatus);
  const draftCountdown = useComposeStore((s) => s.draftCountdown);
  const lastSavedTime = useComposeStore((s) => s.lastSavedTime);

  return (
    <div className="h-9 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-3 flex items-center justify-between select-none">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
          {title}
        </span>
        {draftStatus === 'countdown' && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 animate-pulse shrink-0">
            Saving draft in {draftCountdown}s...
          </span>
        )}
        {draftStatus === 'saving' && (
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 shrink-0">
            Saving draft...
          </span>
        )}
        {draftStatus === 'saved' && (
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal shrink-0">
            Draft saved{lastSavedTime ? ` (${lastSavedTime})` : ''}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={toggleMinimize}
          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition-colors"
          title={isMinimized ? 'Restore' : 'Minimize'}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleMaximize}
          className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300 transition-colors"
          title={isMaximized ? 'Restore size' : 'Maximize'}
        >
          {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={close}
          className="p-1 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/60 rounded text-neutral-600 dark:text-neutral-300 transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

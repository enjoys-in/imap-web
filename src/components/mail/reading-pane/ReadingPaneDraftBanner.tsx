'use client';

import React from 'react';
import { Loader2, Pencil } from 'lucide-react';

interface ReadingPaneDraftBannerProps {
  isLoading: boolean;
  onEdit: () => void;
}

export function ReadingPaneDraftBanner({ isLoading, onEdit }: ReadingPaneDraftBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/60 text-xs">
      <span className="font-medium text-amber-800 dark:text-amber-300 truncate">
        This message is a draft and has not been sent.
      </span>
      <button
        type="button"
        disabled={isLoading}
        onClick={onEdit}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
        <span>Edit draft</span>
      </button>
    </div>
  );
}

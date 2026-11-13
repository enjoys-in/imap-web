'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ReadingPaneSecurityBannerProps {
  onShowBlockedContent: () => void;
  isContentAllowed: boolean;
}

export function ReadingPaneSecurityBanner({
  onShowBlockedContent,
  isContentAllowed,
}: ReadingPaneSecurityBannerProps) {
  if (isContentAllowed) return null;

  return (
    <div className="bg-[#fff8e5] dark:bg-[#2a1d00] border-b border-[#fed888] dark:border-[#553a00] px-4 py-2 flex items-center justify-between text-xs text-[#7a4e00] dark:text-amber-200 select-none transition-colors">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-[#b87600] dark:text-amber-400 shrink-0" />
        <span className="font-medium">
          Some content in this message has been blocked to protect your privacy.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onShowBlockedContent}
          className="px-2.5 py-1 bg-white hover:bg-neutral-50 text-[#7a4e00] border border-[#fed888] dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-amber-200 dark:border-amber-700 rounded font-medium transition-colors cursor-pointer shadow-2xs"
        >
          Show blocked content
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { ReadingPane } from './ReadingPane';

interface PopoutReadingModalProps {
  mailId: string | null;
  onClose: () => void;
}

export function PopoutReadingModal({ mailId, onClose }: PopoutReadingModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!mailId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className={`bg-white dark:bg-[#1c1c1c] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700/80 flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-5xl h-[85vh] max-h-[900px]'
        }`}
      >
        {/* Popout Title Bar */}
        <div className="h-9 px-3 bg-neutral-100 dark:bg-[#252525] border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            <ExternalLink className="w-3.5 h-3.5 text-[#0078d4]" />
            <span>Message Popout Window</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Popout Reading Body */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ReadingPane activeMailId={mailId} onBack={onClose} />
        </div>
      </div>
    </div>
  );
}

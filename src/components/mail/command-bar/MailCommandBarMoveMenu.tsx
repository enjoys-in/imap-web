'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FolderInput, ChevronDown } from 'lucide-react';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { useFolders } from '@/hooks/useEmailsQuery';
import { useMailStore } from '@/stores';
import { cn } from '@/lib/utils';

interface MailCommandBarMoveMenuProps {
  enabled: boolean;
  className?: string;
  isOverflowItem?: boolean;
  onItemExecuted?: () => void;
}

export function MailCommandBarMoveMenu({
  enabled,
  className,
  isOverflowItem = false,
  onItemExecuted,
}: MailCommandBarMoveMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const { data: serverFolders } = useFolders(selectedAccountId);

  const targetFolders = (serverFolders ?? []).map((f) => ({ id: f.id, name: f.displayName }));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectFolder = (folderId: string, folderName: string) => {
    setIsOpen(false);
    dispatchMailAction({
      action: 'move-to',
      folderId,
      folderName,
    });
    onItemExecuted?.();
  };

  if (isOverflowItem) {
    return (
      <div ref={containerRef} className="relative w-full">
        <button
          type="button"
          disabled={!enabled}
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer',
            enabled
              ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
              : 'opacity-40 text-neutral-400 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2">
            <FolderInput className="w-3.5 h-3.5 text-neutral-500" />
            <span>Move to...</span>
          </div>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isOpen && enabled && (
          <div className="pl-6 pr-2 py-1 space-y-0.5 bg-neutral-50 dark:bg-[#1a1a1a] border-y border-neutral-200 dark:border-neutral-800 animate-in fade-in duration-100">
            {targetFolders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleSelectFolder(f.id, f.name)}
                className="w-full text-left px-2 py-1 text-[11px] rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        disabled={!enabled}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'h-7 px-2 rounded flex items-center gap-1.5 transition-colors text-xs whitespace-nowrap select-none',
          enabled
            ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer active:scale-95'
            : 'opacity-35 text-neutral-400 dark:text-neutral-500 cursor-not-allowed pointer-events-none',
          className
        )}
        title={enabled ? 'Move to folder' : 'Select an email'}
      >
        <FolderInput className="w-3.5 h-3.5" />
        <span>Move to</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && enabled && (
        <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {targetFolders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleSelectFolder(f.id, f.name)}
              className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

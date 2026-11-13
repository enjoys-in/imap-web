'use client';

import React from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { useMailStore, useToastStore } from '@/stores';
import { foldersApi } from '@/api';

interface MailboxToolbarActionsProps {
  folderId: string;
  hasEmailTarget?: boolean;
}

export function MailboxToolbarActions({ folderId }: MailboxToolbarActionsProps) {
  const emptyFolder = useMailStore((s) => s.emptyFolder);
  const addToast = useToastStore((s) => s.addToast);

  const isTrashOrJunk = folderId === 'fld-deleted' || folderId === 'fld-junk';

  const handleEmpty = () => {
    emptyFolder(folderId);
    foldersApi.emptyFolder(folderId);
    addToast({ title: 'Folder Emptied', description: 'All messages deleted.', type: 'info' });
  };

  if (!isTrashOrJunk) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 shrink-0 ml-auto select-none text-xs">
      {/* Empty Folder if in Deleted Items or Junk */}
      <button
        onClick={handleEmpty}
        title="Empty all items in this folder"
        className="h-7 px-2 hover:bg-red-50 dark:hover:bg-red-950/40 rounded flex items-center gap-1 text-red-600 dark:text-red-400 font-medium cursor-pointer transition-colors border border-red-200 dark:border-red-900/60"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Empty folder</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
    </div>
  );
}

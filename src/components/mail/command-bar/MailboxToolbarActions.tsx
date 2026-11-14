'use client';

import React from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { useMailStore, useToastStore } from '@/stores';
import { getRegisteredFolder, isTrashOrJunkFolder } from '@/lib/folders';

interface MailboxToolbarActionsProps {
  folderId: string;
  hasEmailTarget?: boolean;
}

export function MailboxToolbarActions({ folderId }: MailboxToolbarActionsProps) {
  const emptyFolder = useMailStore((s) => s.emptyFolder);
  const addToast = useToastStore((s) => s.addToast);

  const isTrashOrJunk = isTrashOrJunkFolder(getRegisteredFolder(folderId));

  const handleEmpty = async () => {
    // One request: the store sends it, updates the screen at once, and keeps the local copy only if the server refuses.
    const res = await emptyFolder(folderId);
    addToast(
      res.success
        ? { title: 'Folder emptied', description: res.message || 'All messages deleted.', type: 'info' }
        : { title: 'Could not empty folder', description: res.message || 'The server did not accept the request.', type: 'error' }
    );
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

'use client';

import React from 'react';
import { MailPlus, ChevronDown, X } from 'lucide-react';
import { useMailStore, useComposeStore } from '@/stores';
import { MailCommandBarActions } from './MailCommandBarActions';
import { MailboxToolbarActions } from './MailboxToolbarActions';

export function MailCommandBar() {
  const selectedIds = useMailStore((s) => s.selectedIds);
  const selectedMailId = useMailStore((s) => s.selectedMailId);
  const localEmails = useMailStore((s) => s.localEmails);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const clearSelectedIds = useMailStore((s) => s.clearSelectedIds);
  const openNew = useComposeStore((s) => s.openNew);

  const activeEmail = localEmails.find((e) => e.id === selectedMailId);
  const hasEmailTarget = selectedIds.length > 0 || Boolean(activeEmail);
  const isMulti = selectedIds.length > 1;
  const isTrashOrJunk = selectedFolderId === 'fld-deleted' || selectedFolderId === 'fld-junk';

  return (
    <div className="bg-[#f0f0f0] dark:bg-[#1b1b1b] border-b border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 shrink-0 select-none transition-colors">
      <div className="h-10 px-2 flex items-center gap-1 overflow-x-auto text-xs justify-between">
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={openNew}
            className="h-7 px-2.5 bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer mr-1 shrink-0 shadow-xs"
            title="Compose new email"
          >
            <MailPlus className="w-3.5 h-3.5" />
            <span>New mail</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          <MailCommandBarActions />

          {/* Multi-select Badge */}
          {isMulti && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0078d4] dark:text-blue-300 font-medium text-[11px] shrink-0 border border-blue-200 dark:border-blue-900/60">
              <span>{selectedIds.length} selected</span>
              <button onClick={clearSelectedIds} title="Clear selection" className="hover:text-red-500 cursor-pointer p-0.5 rounded-full">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Mailbox Mode Badge when no email selected */}
          {!hasEmailTarget && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 text-[11px] font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mailbox Mode</span>
            </div>
          )}
        </div>

        {isTrashOrJunk && (
          <div className="flex items-center gap-1 shrink-0">
            <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700/80 mx-1 shrink-0" />
            <MailboxToolbarActions
              folderId={selectedFolderId || 'fld-inbox'}
              hasEmailTarget={hasEmailTarget}
            />
          </div>
        )}
      </div>
    </div>
  );
}

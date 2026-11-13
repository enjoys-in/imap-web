'use client';

import React, { useMemo } from 'react';
import { MailPlus, ChevronDown } from 'lucide-react';
import { useMailStore, useComposeStore } from '@/stores';
import { MailCommandBarActions } from './MailCommandBarActions';
import { MailboxToolbarActions } from './MailboxToolbarActions';

export function MailCommandBar() {
  const selectedIds = useMailStore((s) => s.selectedIds);
  const selectedMailId = useMailStore((s) => s.selectedMailId);
  const localEmails = useMailStore((s) => s.localEmails);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const openNew = useComposeStore((s) => s.openNew);

  const activeEmail = localEmails.find((e) => e.id === selectedMailId);
  const hasEmailTarget = selectedIds.length > 0 || Boolean(activeEmail);

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
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700/80 mx-1 shrink-0" />
          <MailboxToolbarActions
            folderId={selectedFolderId || 'fld-inbox'}
            hasEmailTarget={hasEmailTarget}
          />
        </div>
      </div>
    </div>
  );
}

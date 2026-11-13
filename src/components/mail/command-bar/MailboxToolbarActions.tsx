'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw, Sliders, ShieldCheck, Settings, Trash2, ChevronDown
} from 'lucide-react';
import { useMailStore, useToastStore } from '@/stores';
import { foldersApi } from '@/api';
import { MailboxQuotaPopover } from './MailboxQuotaPopover';
import { cn } from '@/lib/utils';

interface MailboxToolbarActionsProps {
  folderId: string;
  hasEmailTarget: boolean;
}

export function MailboxToolbarActions({ folderId, hasEmailTarget }: MailboxToolbarActionsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const emptyFolder = useMailStore((s) => s.emptyFolder);
  const fetchEmails = useMailStore((s) => s.fetchEmails);
  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const addToast = useToastStore((s) => s.addToast);

  const isTrashOrJunk = folderId === 'fld-deleted' || folderId === 'fld-junk';

  const handleSync = async () => {
    setIsRefreshing(true);
    try {
      await fetchEmails(folderId, selectedAccountId || undefined);
      addToast({
        title: 'Mailbox Synced',
        description: 'Folder updated with latest messages from IMAP server.',
        type: 'success',
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleEmpty = () => {
    emptyFolder(folderId);
    foldersApi.emptyFolder(folderId);
    addToast({
      title: 'Folder Emptied',
      description: 'All messages in this folder have been deleted.',
      type: 'info',
    });
  };

  return (
    <div className="flex items-center gap-1 shrink-0 ml-auto select-none text-xs">
      {/* Empty Folder if currently in Deleted Items or Junk Email */}
      {isTrashOrJunk && (
        <button
          onClick={handleEmpty}
          title="Empty all items in this folder"
          className="h-7 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded flex items-center gap-1 text-red-600 dark:text-red-400 font-medium cursor-pointer transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Empty folder</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      )}

      {/* Sync / Refresh Mailbox */}
      <button
        onClick={handleSync}
        disabled={isRefreshing}
        title="Check for new mail & sync folder"
        className={cn(
          'h-7 px-2 rounded flex items-center gap-1 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer',
          !hasEmailTarget && 'text-[#0078d4] font-medium'
        )}
      >
        <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-[#0078d4]')} />
        <span className="hidden md:inline">Sync</span>
      </button>

      {/* Mailbox Storage & Quota */}
      <MailboxQuotaPopover isHighlighted={!hasEmailTarget} />

      {/* Rules & Policy Management */}
      <Link
        href="/settings/mail/rules"
        title="Configure Mailbox Rules & Automation Policies"
        className={cn(
          'h-7 px-2 rounded flex items-center gap-1 transition-colors cursor-pointer',
          !hasEmailTarget
            ? 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      >
        <Sliders className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden md:inline">Rules</span>
      </Link>

      {/* Junk & Spam Filter */}
      <Link
        href="/settings/mail/junk"
        title="Spam Filter & Safe/Blocked Senders Policy"
        className={cn(
          'h-7 px-2 rounded flex items-center gap-1 transition-colors cursor-pointer',
          !hasEmailTarget
            ? 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-medium'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span className="hidden lg:inline">Spam filter</span>
      </Link>

      {/* Mailbox Settings */}
      <Link
        href="/settings/accounts"
        title="Mailbox & Account Settings"
        className="h-7 px-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded flex items-center gap-1 transition-colors cursor-pointer"
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">Settings</span>
      </Link>
    </div>
  );
}

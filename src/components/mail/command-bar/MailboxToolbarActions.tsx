'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Sliders, ShieldCheck, Settings, Trash2, ChevronDown } from 'lucide-react';
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
    addToast({ title: 'Folder Emptied', description: 'All messages deleted.', type: 'info' });
  };

  return (
    <div className="flex items-center gap-1 shrink-0 ml-auto select-none text-xs">
      {/* Empty Folder if in Deleted Items or Junk */}
      {isTrashOrJunk && (
        <button
          onClick={handleEmpty}
          title="Empty all items in this folder"
          className="h-7 px-2 hover:bg-red-50 dark:hover:bg-red-950/40 rounded flex items-center gap-1 text-red-600 dark:text-red-400 font-medium cursor-pointer transition-colors border border-red-200 dark:border-red-900/60"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Empty folder</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      )}

      {/* Sync / Refresh Mailbox */}
      <button
        onClick={handleSync}
        disabled={isRefreshing}
        title="Check for new mail & sync folder with IMAP server"
        className={cn(
          'h-7 px-2.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer font-medium text-xs',
          !hasEmailTarget
            ? 'bg-blue-50 hover:bg-blue-100 text-[#0078d4] dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-2xs'
            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      >
        <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-[#0078d4]')} />
        <span>Sync</span>
      </button>

      {/* Mailbox Storage & Quota */}
      <MailboxQuotaPopover isHighlighted={!hasEmailTarget} />

      {/* Rules & Policy Management */}
      <Link
        href="/settings/mail/rules"
        title="Configure server-side filtering rules & automation policies"
        className={cn(
          'h-7 px-2.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer font-medium text-xs',
          !hasEmailTarget
            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      >
        <Sliders className="w-3.5 h-3.5 text-indigo-500" />
        <span>Rules</span>
      </Link>

      {/* Junk & Spam Filter */}
      <Link
        href="/settings/mail/junk"
        title="Manage spam filter threshold and safe/blocked senders"
        className={cn(
          'h-7 px-2.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer font-medium text-xs',
          !hasEmailTarget
            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Spam filter</span>
      </Link>

      {/* Mailbox Settings */}
      <Link
        href="/settings/accounts"
        title="Mailbox & Account Settings"
        className={cn(
          'h-7 px-2.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer font-medium text-xs',
          !hasEmailTarget
            ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 shadow-2xs'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      >
        <Settings className="w-3.5 h-3.5" />
        <span>Settings</span>
      </Link>
    </div>
  );
}

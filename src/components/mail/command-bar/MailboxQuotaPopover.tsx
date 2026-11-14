'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { HardDrive, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QUOTA_FULL_GRADIENT } from '@/components/mail/folders/SidebarQuota';
import { useQuota } from '@/hooks/useEmailsQuery';

interface MailboxQuotaPopoverProps {
  isHighlighted?: boolean;
}

export function MailboxQuotaPopover({ isHighlighted }: MailboxQuotaPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: quota } = useQuota();

  // Close when clicking outside
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

  // No quota reported by the server: show nothing rather than made-up numbers.
  if (!quota?.storage?.limit) return null;

  const usedMb = quota.storage.used ? Math.round(quota.storage.used / (1024 * 1024)) : 0;
  const totalMb = Math.round(quota.storage.limit / (1024 * 1024));
  const pct = quota?.storage?.percentage !== undefined ? Math.round(quota.storage.percentage) : Math.round((usedMb / totalMb) * 100);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        title="Check Mailbox Quota & Storage"
        className={cn(
          'h-7 px-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs',
          isHighlighted
            ? 'bg-blue-50 text-[#0078d4] font-medium hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60'
            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
        )}
      >
        <HardDrive className="w-3.5 h-3.5 text-blue-500" />
        <span className="hidden sm:inline">Quota</span>
        <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
          {pct}%
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700/80 rounded-lg shadow-xl p-3.5 z-50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100 select-none">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#0078d4]" />
              <span className="font-semibold text-neutral-900 dark:text-white">Mailbox Storage</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>Used space</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                {(usedMb / 1024).toFixed(1)} GB of {(totalMb / 1024).toFixed(0)} GB ({pct}%)
              </span>
            </div>

            <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
                style={{ width: `${pct}%` }}
              >
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${pct > 0 ? (100 / pct) * 100 : 100}%`,
                    background: QUOTA_FULL_GRADIENT,
                  }}
                />
              </div>
            </div>

            <div className="pt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>Free: </span>
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {((totalMb - usedMb) / 1024).toFixed(1)} GB remaining
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
            <span className="text-[10px] text-neutral-400">IMAP Quota</span>
            <Link
              href="/settings/accounts/storage"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-[#0078d4] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Storage</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

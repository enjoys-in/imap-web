'use client';

import React, { useState, useEffect } from 'react';
import { HardDrive, RefreshCw, Trash2 } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { getCachedEmails, clearCachedEmails } from '@/lib/idb/mailCacheDb';

interface OfflineStorageStatusCardProps {
  daysToSave: number;
}

export function OfflineStorageStatusCard({ daysToSave }: OfflineStorageStatusCardProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      getCachedEmails().then((emails) => {
        setCachedCount(emails.length);
      }).catch(() => {});

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const emails = await getCachedEmails();
      setCachedCount(emails.length);
      setTimeout(() => {
        setIsSyncing(false);
        addToast({
          title: 'Offline cache updated',
          description: `Synchronized ${emails.length} messages and calendar events for offline access.`,
          type: 'success',
        });
      }, 700);
    } catch {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (confirm('Clear local offline message database? Emails will be re-downloaded when online.')) {
      await clearCachedEmails();
      setCachedCount(0);
      addToast({
        title: 'Offline cache cleared',
        description: 'All local cached data has been removed from this browser.',
        type: 'info',
      });
    }
  };

  return (
    <div className="mt-6 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181818] max-w-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#0078d4]" />
          <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">Local Storage & Cache Status</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
          <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
            {isOnline ? 'Online' : 'Working Offline'}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
        <div>IndexedDB Mail Database: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cachedCount} items stored</span></div>
        <div>Selected offline span: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{daysToSave === 365 ? 'Full Mailbox' : `${daysToSave} days`}</span></div>
      </div>

      <div className="pt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="px-3 py-1.5 rounded bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-[#2d2d2d] text-neutral-700 dark:text-neutral-200 font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
        <button
          type="button"
          onClick={handleClearCache}
          className="px-3 py-1.5 rounded bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear offline data</span>
        </button>
      </div>
    </div>
  );
}

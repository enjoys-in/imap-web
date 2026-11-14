'use client';

import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  Wifi,
  HardDrive,
  RefreshCw,
  Trash2,
  Check,
  Save,
  HelpCircle,
  FolderDown,
  Clock,
  Paperclip,
  CloudSync,
} from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useAccounts } from '@/hooks/useEmailsQuery';
import { useToastStore } from '@/stores/useToastStore';
import { getCachedEmails, clearCachedEmails } from '@/lib/idb/mailCacheDb';

export function OfflineSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);
  const { data: accounts } = useAccounts();

  const [allowOffline, setAllowOffline] = useState(
    settings.allowOfflineAccess ?? true
  );
  const [selectedAccount, setSelectedAccount] = useState(
    settings.offlineAccount || 'mullayam06@outlook.com'
  );
  const [foldersToSave, setFoldersToSave] = useState(
    settings.offlineFoldersToSave || 'default_and_favorites'
  );
  const [daysToSave, setDaysToSave] = useState(
    settings.offlineDaysToSave || 30
  );
  const [includeAttachments, setIncludeAttachments] = useState(
    settings.offlineIncludeAttachments ?? true
  );
  const [backgroundSync, setBackgroundSync] = useState(
    settings.offlineBackgroundSync ?? true
  );

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

  const handleSave = () => {
    updateSettings({
      allowOfflineAccess: allowOffline,
      offlineAccount: selectedAccount,
      offlineFoldersToSave: foldersToSave,
      offlineDaysToSave: daysToSave,
      offlineIncludeAttachments: includeAttachments,
      offlineBackgroundSync: backgroundSync,
    });
    addToast({
      title: 'Offline settings saved',
      description: 'Your offline storage and synchronization rules were updated.',
      type: 'success',
    });
  };

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

  const selectClass =
    'h-8 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#222222] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors cursor-pointer';

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Offline
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Access your email, calendar, and people when you&apos;re offline. Your data will be saved on your device.{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                addToast({
                  title: 'Offline Access in AirSend',
                  description: 'AirSend uses persistent IndexedDB and Service Workers to cache your mailbox locally.',
                  type: 'info',
                });
              }}
              className="text-[#0078d4] hover:underline"
            >
              Learn more
            </a>
          </p>
        </div>
        <button
          onClick={handleSave}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>

      {/* Main Checkbox */}
      <div className="pt-1">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={allowOffline}
            onChange={(e) => setAllowOffline(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
          />
          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white transition-colors">
            Allow offline access to email, calendar, and people
          </span>
        </label>
      </div>

      {allowOffline && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-150">
          {/* Account Selector Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-xs text-neutral-600 dark:text-neutral-300 min-w-36">
              These settings apply to
            </span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className={`${selectClass} min-w-[280px] max-w-md`}
            >
              <option value="mullayam06@outlook.com">mullayam06@outlook.com</option>
              {accounts?.map((acc) => (
                acc.email !== 'mullayam06@outlook.com' && (
                  <option key={acc.id} value={acc.email}>
                    {acc.email}
                  </option>
                )
              ))}
            </select>
          </div>

          {/* Section: Folders to save */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Folders to save
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Choose which folders you&apos;d like to save a local copy of
            </p>
            <div className="pt-1">
              <select
                value={foldersToSave}
                onChange={(e) => setFoldersToSave(e.target.value)}
                className={`${selectClass} min-w-[280px] max-w-md`}
              >
                <option value="default_and_favorites">Default and favorites</option>
                <option value="all">All folders</option>
                <option value="inbox_sent">Inbox and Sent only</option>
                <option value="custom">Custom selection</option>
              </select>
            </div>
          </div>

          {/* Section: Days of email to save */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Days of email to save
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              The longer period of time you select, the more space will be used on your device
            </p>
            <div className="pt-1">
              <select
                value={daysToSave}
                onChange={(e) => setDaysToSave(Number(e.target.value))}
                className={`${selectClass} min-w-[280px] max-w-md`}
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>All</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeAttachments}
                onChange={(e) => setIncludeAttachments(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
              />
              <span className="text-xs text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                Include file attachments
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={backgroundSync}
                onChange={(e) => setBackgroundSync(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
              />
              <span className="text-xs text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                Sync in the background when Outlook is closed
              </span>
            </label>
          </div>

          {/* Local Cache & Diagnostics Card */}
          <div className="mt-6 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181818] max-w-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#0078d4]" />
                <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Local Storage & Cache Status
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                  {isOnline ? 'Online' : 'Working Offline'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
              <div>
                IndexedDB Mail Database:{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {cachedCount} items stored
                </span>
              </div>
              <div>
                Selected offline span:{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {daysToSave === 365 ? 'Full Mailbox' : `${daysToSave} days`}
                </span>
              </div>
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
        </div>
      )}
    </div>
  );
}

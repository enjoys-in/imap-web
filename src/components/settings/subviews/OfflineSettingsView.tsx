'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useAccounts } from '@/hooks/useEmailsQuery';
import { useToastStore } from '@/stores/useToastStore';
import { OfflineStorageStatusCard } from './offline/OfflineStorageStatusCard';

export function OfflineSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);
  const { data: accounts } = useAccounts();

  const [allowOffline, setAllowOffline] = useState(settings.allowOfflineAccess ?? true);
  const [selectedAccount, setSelectedAccount] = useState(settings.offlineAccount || '');
  const [foldersToSave, setFoldersToSave] = useState(settings.offlineFoldersToSave || 'default_and_favorites');
  const [daysToSave, setDaysToSave] = useState(settings.offlineDaysToSave || 30);
  const [includeAttachments, setIncludeAttachments] = useState(settings.offlineIncludeAttachments ?? true);
  const [backgroundSync, setBackgroundSync] = useState(settings.offlineBackgroundSync ?? true);

  const effectiveAccount = selectedAccount || accounts?.[0]?.email || '';

  const handleSave = () => {
    updateSettings({
      allowOfflineAccess: allowOffline,
      offlineAccount: effectiveAccount,
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

  const selectClass =
    'h-8 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#222222] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors cursor-pointer';

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none pb-12">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Offline</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Access your email, calendar, and people when you&apos;re offline. Your data will be saved on your device.
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-xs text-neutral-600 dark:text-neutral-300 min-w-36">These settings apply to</span>
            <select
              value={effectiveAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className={`${selectClass} min-w-[280px] max-w-md`}
            >
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.email}>{acc.email}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Folders to save</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Choose which folders you&apos;d like to save a local copy of</p>
            <div className="pt-1">
              <select value={foldersToSave} onChange={(e) => setFoldersToSave(e.target.value)} className={`${selectClass} min-w-[280px] max-w-md`}>
                <option value="default_and_favorites">Default and favorites</option>
                <option value="all">All folders</option>
                <option value="inbox_sent">Inbox and Sent only</option>
                <option value="custom">Custom selection</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Days of email to save</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">The longer period of time you select, the more space will be used on your device</p>
            <div className="pt-1">
              <select value={daysToSave} onChange={(e) => setDaysToSave(Number(e.target.value))} className={`${selectClass} min-w-[280px] max-w-md`}>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>All</option>
              </select>
            </div>
          </div>

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

          <OfflineStorageStatusCard daysToSave={daysToSave} />
        </div>
      )}
    </div>
  );
}

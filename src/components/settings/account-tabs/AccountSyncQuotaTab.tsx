'use client';

import React from 'react';
import { Database } from 'lucide-react';
import { AccountSyncQuotaSettings } from '@/types/perAccountSettings';
import { useToastStore } from '@/stores/useToastStore';

interface AccountSyncQuotaTabProps {
  settings: AccountSyncQuotaSettings;
  onChange: (updates: Partial<AccountSyncQuotaSettings>) => void;
}

export function AccountSyncQuotaTab({ settings, onChange }: AccountSyncQuotaTabProps) {
  const addToast = useToastStore((s) => s.addToast);
  const inputClass = 'h-7 px-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525]';

  return (
    <div className="space-y-5 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#0078d4]" />
          <span>Synchronisation & Disk Space / Quota</span>
        </h4>
        <p className="text-neutral-500 mt-0.5">Local offline message caching, message age limits, and storage recovery quotas.</p>
      </div>

      {/* Message Synchronizing */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">Message Synchronizing</span>
          <button
            type="button"
            onClick={() => addToast({ title: 'Advanced Folder Sync', description: 'Opening folder-specific synchronization tree...', type: 'info' })}
            className="px-2.5 py-1 text-[11px] rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Advanced…
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings.keepAllMessagesLocally} onChange={(e) => onChange({ keepAllMessagesLocally: e.target.checked })} className="accent-[#0078d4] rounded" />
          <span>Keep messages in all folders for this account on this computer</span>
        </label>
        <p className="text-[11px] text-neutral-500 pl-6">Note: Changing this affects all folders in this account. To set individual folders, use Advanced…</p>
      </div>

      {/* Disk Space Cache Limits */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Disk Space & Download Restrictions</span>
        <div className="space-y-1.5 pl-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="syncAgeMode" checked={settings.syncAgeMode === 'all'} onChange={() => onChange({ syncAgeMode: 'all' })} className="accent-[#0078d4]" />
            <span>Synchronize all messages locally regardless of age</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="syncAgeMode" checked={settings.syncAgeMode === 'recent'} onChange={() => onChange({ syncAgeMode: 'recent' })} className="accent-[#0078d4]" />
              <span>Synchronize the most recent</span>
            </label>
            <input type="number" min={1} max={365} value={settings.syncRecentDays} onChange={(e) => onChange({ syncRecentDays: Number(e.target.value) })} className={`w-16 ${inputClass}`} />
            <span>days</span>
          </div>
        </div>
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 flex items-center gap-2 pl-2">
          <span>Don&apos;t download messages larger than</span>
          <input type="number" min={10} max={50000} value={settings.dontDownloadLargerThanKb} onChange={(e) => onChange({ dontDownloadLargerThanKb: Number(e.target.value) })} className={`w-20 ${inputClass}`} />
          <span>KB</span>
        </div>
      </div>

      {/* Quota & Old Message Deletion */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Space / Quota & Message Expiry</span>
        <div className="space-y-1.5 pl-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="deletionRecoveryMode" checked={settings.deletionRecoveryMode === 'none'} onChange={() => onChange({ deletionRecoveryMode: 'none' })} className="accent-[#0078d4]" />
            <span>Don&apos;t delete any messages</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="deletionRecoveryMode" checked={settings.deletionRecoveryMode === 'keep_recent'} onChange={() => onChange({ deletionRecoveryMode: 'keep_recent' })} className="accent-[#0078d4]" />
              <span>Delete all but the most recent</span>
            </label>
            <input type="number" min={100} max={50000} value={settings.keepRecentMessagesCount} onChange={(e) => onChange({ keepRecentMessagesCount: Number(e.target.value) })} className={`w-20 ${inputClass}`} />
            <span>messages</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="deletionRecoveryMode" checked={settings.deletionRecoveryMode === 'older_than'} onChange={() => onChange({ deletionRecoveryMode: 'older_than' })} className="accent-[#0078d4]" />
              <span>Delete messages more than</span>
            </label>
            <input type="number" min={30} max={1000} value={settings.deleteOlderThanDays} onChange={(e) => onChange({ deleteOlderThanDays: Number(e.target.value) })} className={`w-16 ${inputClass}`} />
            <span>days</span>
          </div>
        </div>
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 pl-2">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input type="checkbox" checked={settings.alwaysKeepStarred} onChange={(e) => onChange({ alwaysKeepStarred: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Always keep starred messages</span>
          </label>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HardDrive, Trash2 } from 'lucide-react';
import { useAccounts, useFolders, useQuota } from '@/hooks/useEmailsQuery';
import { useMailStore, useToastStore } from '@/stores';
import { foldersApi } from '@/lib/api';
import { QUOTA_FULL_GRADIENT } from '@/components/mail/folders/SidebarQuota';

export function StorageSettingsView() {
  const queryClient = useQueryClient();
  const { data: accountsData } = useAccounts();
  const { data: quota } = useQuota();
  const accounts = accountsData ?? [];
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const activeAccountId = selectedAccountId || accounts[0]?.id || '';
  const { data: folders = [] } = useFolders(activeAccountId);
  const emptyFolder = useMailStore((s) => s.emptyFolder);
  const addToast = useToastStore((s) => s.addToast);

  const totalUsedMb = quota?.storage?.used ? Math.round(quota.storage.used / (1024 * 1024)) : undefined;
  const totalQuotaMb = quota?.storage?.limit ? Math.round(quota.storage.limit / (1024 * 1024)) : undefined;
  const hasQuota = totalUsedMb !== undefined && totalQuotaMb !== undefined && totalQuotaMb > 0;
  const percentUsed = hasQuota
    ? quota?.storage?.percentage !== undefined
      ? Math.round(quota.storage.percentage)
      : Math.round((totalUsedMb / totalQuotaMb) * 100)
    : 0;

  const handleEmpty = async (folderId: string, name: string) => {
    emptyFolder(folderId);
    try {
      const res = await foldersApi.emptyFolder(folderId);
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      addToast({
        title: 'Folder emptied',
        description: res?.message || `Emptied all items in ${name}`,
        type: res?.success ? 'info' : 'warning',
      });
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err?.message || `Failed to empty ${name}`,
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Storage</h2>
        <p className="text-neutral-500 mt-0.5">View and manage mailbox space across folders.</p>
      </div>

      {/* Account Selector */}
      <div className="p-3 bg-neutral-50 dark:bg-[#1a1a1a] rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Select account:</label>
        <select
          value={activeAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.email} ({a.accountType || 'IMAP'})</option>
          ))}
        </select>
      </div>

      {/* Quota Progress Card */}
      <div className="p-4 bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#0078d4]" />
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Mailbox storage</span>
          </div>
          {hasQuota && (
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {(totalUsedMb / 1024).toFixed(1)} GB of {(totalQuotaMb / 1024).toFixed(0)} GB used ({percentUsed}%)
            </span>
          )}
        </div>

        {hasQuota ? (
          <>
            {/* Minimized Progress Bar with True Full-Track Gradient */}
            <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
                style={{ width: `${percentUsed}%` }}
              >
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${percentUsed > 0 ? (100 / percentUsed) * 100 : 100}%`,
                    background: QUOTA_FULL_GRADIENT,
                  }}
                />
              </div>
            </div>

            <p className="text-[11px] text-neutral-500">
              You have {((totalQuotaMb - totalUsedMb) / 1024).toFixed(1)} GB of free space available.
            </p>
          </>
        ) : (
          <p className="text-[11px] text-neutral-500">Storage quota is not reported by this mail server.</p>
        )}
      </div>

      {/* Breakdown per Folder */}
      <div className="space-y-2">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Folders</h3>
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-[#1c1c1c] overflow-hidden">
          {folders.length === 0 && (
            <div className="p-3 text-[11px] text-neutral-500">No folders to show.</div>
          )}
          {folders.map((f) => (
            <div key={f.id} className="p-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#222222] transition-colors">
              <div>
                <span className="font-medium text-neutral-800 dark:text-neutral-200 block">{f.displayName}</span>
                <span className="text-[11px] text-neutral-500">
                  {f.totalCount} {f.totalCount === 1 ? 'message' : 'messages'}
                  {f.unreadCount > 0 ? ` · ${f.unreadCount} unread` : ''}
                </span>
              </div>

              {(f.special === 'Trash' || f.special === 'Junk') && f.totalCount > 0 && (
                <button
                  onClick={() => handleEmpty(f.id, f.displayName)}
                  className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empty</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

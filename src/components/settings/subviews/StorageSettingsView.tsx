'use client';

import React, { useState } from 'react';
import { HardDrive, Trash2, CheckCircle2 } from 'lucide-react';
import { MOCK_ACCOUNTS } from '@/lib/mock';
import { useMailStore, useToastStore } from '@/stores';
import { foldersApi } from '@/lib/api';

interface FolderStorageItem {
  id: string;
  name: string;
  sizeMb: number;
}

export function StorageSettingsView() {
  const [selectedAccountId, setSelectedAccountId] = useState('acc-1');
  const [folderSizes, setFolderSizes] = useState<FolderStorageItem[]>([
    { id: 'fld-inbox', name: 'Inbox', sizeMb: 2840 },
    { id: 'fld-sent', name: 'Sent Items', sizeMb: 850 },
    { id: 'fld-archive', name: 'Archive', sizeMb: 450 },
    { id: 'fld-trash', name: 'Deleted Items', sizeMb: 95 },
    { id: 'fld-junk', name: 'Junk Email', sizeMb: 25 },
  ]);
  const emptyFolder = useMailStore((s) => s.emptyFolder);
  const addToast = useToastStore((s) => s.addToast);

  const totalUsedMb = folderSizes.reduce((sum, f) => sum + f.sizeMb, 0);
  const totalQuotaMb = 15360; // 15 GB
  const percentUsed = Math.round((totalUsedMb / totalQuotaMb) * 100);

  const handleEmpty = (folderId: string, name: string) => {
    emptyFolder(folderId);
    foldersApi.emptyFolder(folderId);
    setFolderSizes((prev) => prev.map((f) => (f.id === folderId ? { ...f, sizeMb: 0 } : f)));
    addToast({ title: 'Folder emptied', description: `Emptied all items in ${name}`, type: 'info' });
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
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
        >
          {MOCK_ACCOUNTS.map((a) => (
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
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            {(totalUsedMb / 1024).toFixed(1)} GB of {(totalQuotaMb / 1024).toFixed(0)} GB used ({percentUsed}%)
          </span>
        </div>

        {/* Progress Bar with Gradient */}
        <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative border border-neutral-300/40 dark:border-neutral-700/40">
          <div
            style={{
              width: `${percentUsed}%`,
              background: 'linear-gradient(90deg, #10b981 0%, #84cc16 25%, #eab308 50%, #f97316 75%, #ef4444 100%)',
            }}
            className="h-full rounded-full transition-all duration-300 relative"
          />
          {/* Subtle tick markers for 25%, 50%, 75% */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-white/40 dark:bg-black/40" />
            <span className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-white/40 dark:bg-black/40" />
            <span className="absolute top-0 bottom-0 left-[75%] w-[1px] bg-white/40 dark:bg-black/40" />
          </div>
        </div>

        {/* 25 50 75 100 percent scale */}
        <div className="flex justify-between items-center text-[10px] font-mono select-none pt-0.5">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            25%
          </span>
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            50%
          </span>
          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
            75%
          </span>
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            100%
          </span>
        </div>

        <p className="text-[11px] text-neutral-500">
          You have {((totalQuotaMb - totalUsedMb) / 1024).toFixed(1)} GB of free space available.
        </p>
      </div>

      {/* Breakdown per Folder */}
      <div className="space-y-2">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Folder storage breakdown</h3>
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-[#1c1c1c] overflow-hidden">
          {folderSizes.map((f) => (
            <div key={f.id} className="p-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#222222] transition-colors">
              <div>
                <span className="font-medium text-neutral-800 dark:text-neutral-200 block">{f.name}</span>
                <span className="text-[11px] text-neutral-500">{f.sizeMb > 1024 ? `${(f.sizeMb / 1024).toFixed(1)} GB` : `${f.sizeMb} MB`}</span>
              </div>

              {(f.id === 'fld-trash' || f.id === 'fld-junk') && f.sizeMb > 0 && (
                <button
                  onClick={() => handleEmpty(f.id, f.name)}
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

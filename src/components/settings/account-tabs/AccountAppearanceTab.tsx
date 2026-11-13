'use client';

import React from 'react';
import { Layout } from 'lucide-react';
import { AccountAppearanceSettings } from '@/types/perAccountSettings';

interface AccountAppearanceTabProps {
  settings: AccountAppearanceSettings;
  onChange: (updates: Partial<AccountAppearanceSettings>) => void;
}

export function AccountAppearanceTab({ settings, onChange }: AccountAppearanceTabProps) {
  return (
    <div className="space-y-5 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Layout className="w-4 h-4 text-[#0078d4]" />
          <span>Appearance & Layout</span>
        </h4>
        <p className="text-neutral-500 mt-0.5">Configure window chrome, message list density, sorting, and conversation threading.</p>
      </div>

      {/* Window Layout */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Window Layout</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings.hideSystemTitlebar} onChange={(e) => onChange({ hideSystemTitlebar: e.target.checked })} className="accent-[#0078d4] rounded" />
          <span>Hide system window titlebar</span>
        </label>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.autoHideTabBar} onChange={(e) => onChange({ autoHideTabBar: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Auto hide tab bar</span>
          </label>
          <p className="text-[11px] text-neutral-500 pl-6">Hide the tab bar when only a single tab is open</p>
        </div>
      </div>

      {/* Message List */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Message List</span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="messageListView" checked={settings.messageListView === 'cards'} onChange={() => onChange({ messageListView: 'cards' })} className="accent-[#0078d4]" />
            <span>Cards view</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="messageListView" checked={settings.messageListView === 'table'} onChange={() => onChange({ messageListView: 'table' })} className="accent-[#0078d4]" />
            <span>Table view</span>
          </label>
        </div>

        {settings.messageListView === 'cards' && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 flex items-center gap-4 pl-2 text-[11px]">
            <span className="font-medium text-neutral-500">Cards View Options:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="cardsViewRows" checked={settings.cardsViewRows === 2} onChange={() => onChange({ cardsViewRows: 2 })} className="accent-[#0078d4]" />
              <span>2 rows</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="cardsViewRows" checked={settings.cardsViewRows === 3} onChange={() => onChange({ cardsViewRows: 3 })} className="accent-[#0078d4]" />
              <span>3 rows</span>
            </label>
          </div>
        )}
      </div>

      {/* Sorting and Threading */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Sorting and Threading</span>
        <p className="text-[11px] text-neutral-500">Define the default sorting and threading options for newly created folders.</p>

        <div className="flex flex-wrap gap-4 pt-1">
          {(['unthreaded', 'threaded', 'grouped'] as const).map((mode) => (
            <label key={mode} className="flex items-center gap-1.5 cursor-pointer capitalize">
              <input type="radio" name="threadingMode" checked={settings.threadingMode === mode} onChange={() => onChange({ threadingMode: mode })} className="accent-[#0078d4]" />
              <span>{mode === 'grouped' ? 'Grouped by Sort' : mode}</span>
            </label>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] text-neutral-500 block mb-1">Default Sort by:</label>
            <select value={settings.defaultSortBy} onChange={(e) => onChange({ defaultSortBy: e.target.value as any })} className="w-full h-7 px-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525]">
              <option value="date">Date</option>
              <option value="sender">Sender</option>
              <option value="subject">Subject</option>
              <option value="size">Size</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-neutral-500 block mb-1">Default Sort Order:</label>
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="defaultSortOrder" checked={settings.defaultSortOrder === 'ascending'} onChange={() => onChange({ defaultSortOrder: 'ascending' })} className="accent-[#0078d4]" />
                <span>Ascending (New at bottom)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="defaultSortOrder" checked={settings.defaultSortOrder === 'descending'} onChange={() => onChange({ defaultSortOrder: 'descending' })} className="accent-[#0078d4]" />
                <span>Descending (New at top)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 flex items-center gap-4 text-[11px]">
          <span className="text-neutral-500">Propagate settings to:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="propagateToFolders" checked={settings.propagateToFolders === 'all'} onChange={() => onChange({ propagateToFolders: 'all' })} className="accent-[#0078d4]" />
            <span>All existing folders</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="propagateToFolders" checked={settings.propagateToFolders === 'choose'} onChange={() => onChange({ propagateToFolders: 'choose' })} className="accent-[#0078d4]" />
            <span>Choose…</span>
          </label>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Search, History, Trash2, Save, Check } from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';

export function SearchSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [searchScope, setSearchScope] = useState<'all_folders' | 'current_folder'>(
    settings.searchScope || 'all_folders'
  );
  const [includeDeleted, setIncludeDeleted] = useState(
    settings.includeDeletedInSearch ?? false
  );
  const [saveHistory, setSaveHistory] = useState(
    settings.saveSearchHistory ?? true
  );

  const handleSave = () => {
    updateSettings({
      searchScope,
      includeDeletedInSearch: includeDeleted,
      saveSearchHistory: saveHistory,
    });
    addToast({
      title: 'Search preferences saved',
      description: 'Your default search scope and query indexing were updated.',
      type: 'success',
    });
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('airsend_search_history');
    }
    addToast({
      title: 'Search history cleared',
      description: 'All recent search queries and keywords have been removed.',
      type: 'info',
    });
  };

  const selectClass =
    'h-8 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#222222] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors cursor-pointer';

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 pb-12">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Search
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configure how AirSend searches your messages, folders, and attachments.
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

      <div className="space-y-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs">
        <div className="space-y-1.5">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
            Default search scope
          </span>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Choose whether the search bar queries all mailbox folders or only the current folder by default.
          </p>
          <div className="pt-1">
            <select
              value={searchScope}
              onChange={(e) => setSearchScope(e.target.value as any)}
              className={`${selectClass} min-w-[280px] max-w-md`}
            >
              <option value="all_folders">All folders</option>
              <option value="current_folder">Current folder only</option>
            </select>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-start justify-between cursor-pointer">
          <label className="flex items-start justify-between w-full cursor-pointer">
            <div className="pr-4">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                Include deleted items in search results
              </span>
              <span className="text-neutral-500 text-[11px]">
                Show matching messages located in the Trash / Deleted Items folder.
              </span>
            </div>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="w-4 h-4 accent-[#0078d4] rounded mt-0.5 cursor-pointer"
            />
          </label>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-start justify-between cursor-pointer">
          <label className="flex items-start justify-between w-full cursor-pointer">
            <div className="pr-4">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                Keep search history
              </span>
              <span className="text-neutral-500 text-[11px]">
                Remembers recent queries in the search drop-down for faster lookups.
              </span>
            </div>
            <input
              type="checkbox"
              checked={saveHistory}
              onChange={(e) => setSaveHistory(e.target.checked)}
              className="w-4 h-4 accent-[#0078d4] rounded mt-0.5 cursor-pointer"
            />
          </label>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                Search history storage
              </span>
              <span className="text-neutral-500 text-[11px]">
                Clear your saved search keywords, recent contacts, and filter history from this device.
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-[#2d2d2d] text-neutral-700 dark:text-neutral-200 font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear search history</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

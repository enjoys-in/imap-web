'use client';

import React, { useState } from 'react';
import { PlayCircle, Folder, Save, Check } from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';

export function StartupSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [startupFolder, setStartupFolder] = useState<'inbox' | 'last_opened' | 'calendar'>(
    settings.startupFolder || 'inbox'
  );
  const [restoreWindows, setRestoreWindows] = useState(
    settings.restorePreviousWindows ?? true
  );

  const handleSave = () => {
    updateSettings({
      startupFolder,
      restorePreviousWindows: restoreWindows,
    });
    addToast({
      title: 'Startup settings saved',
      description: 'Your startup folder and session restoration preferences were saved.',
      type: 'success',
    });
  };

  const selectClass =
    'h-8 px-3 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#222222] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors cursor-pointer';

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none pb-12">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Start up
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Choose what opens first when AirSend launches.
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
            Open on startup
          </span>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Select the default view or folder loaded when opening the application.
          </p>
          <div className="pt-1">
            <select
              value={startupFolder}
              onChange={(e) => setStartupFolder(e.target.value as any)}
              className={`${selectClass} min-w-[280px] max-w-md`}
            >
              <option value="inbox">Inbox</option>
              <option value="last_opened">Continue where you left off</option>
              <option value="calendar">Calendar</option>
            </select>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-start justify-between cursor-pointer">
          <label className="flex items-start justify-between w-full cursor-pointer">
            <div className="pr-4">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                Restore open compose windows & drafts
              </span>
              <span className="text-neutral-500 text-[11px]">
                Re-opens any active compose draft or popout reading pane upon restarting.
              </span>
            </div>
            <input
              type="checkbox"
              checked={restoreWindows}
              onChange={(e) => setRestoreWindows(e.target.checked)}
              className="w-4 h-4 accent-[#0078d4] rounded mt-0.5 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

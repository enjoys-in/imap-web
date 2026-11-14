'use client';

import React, { useState } from 'react';
import { ShieldCheck, Download, Trash2, Save, Lock } from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';

export function PrivacySettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [shareDiagnostics, setShareDiagnostics] = useState(
    settings.shareDiagnostics ?? false
  );
  const [connectedServices, setConnectedServices] = useState(
    settings.connectedServices ?? true
  );

  const handleSave = () => {
    updateSettings({
      shareDiagnostics,
      connectedServices,
    });
    addToast({
      title: 'Privacy settings saved',
      description: 'Your telemetry and data preferences were updated.',
      type: 'success',
    });
  };

  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      settings: useGeneralSettingsStore.getState(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airsend-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      title: 'Settings Exported',
      description: 'Your configuration data has been saved to your downloads folder.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 pb-12">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Privacy and data
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your diagnostic data, connected experiences, and data exports.
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
        <label className="flex items-start justify-between cursor-pointer">
          <div className="pr-4">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
              Send optional diagnostic data
            </span>
            <span className="text-neutral-500 text-[11px]">
              Helps us improve performance, crash recovery, and security across email synchronization.
            </span>
          </div>
          <input
            type="checkbox"
            checked={shareDiagnostics}
            onChange={(e) => setShareDiagnostics(e.target.checked)}
            className="w-4 h-4 accent-[#0078d4] rounded mt-0.5 cursor-pointer"
          />
        </label>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-start justify-between cursor-pointer">
          <label className="flex items-start justify-between w-full cursor-pointer">
            <div className="pr-4">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                Connected experiences & smart previews
              </span>
              <span className="text-neutral-500 text-[11px]">
                Enables BIMI brand logos, link rich previews, and intelligent calendar suggestions.
              </span>
            </div>
            <input
              type="checkbox"
              checked={connectedServices}
              onChange={(e) => setConnectedServices(e.target.checked)}
              className="w-4 h-4 accent-[#0078d4] rounded mt-0.5 cursor-pointer"
            />
          </label>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                Export mailbox configuration
              </span>
              <span className="text-neutral-500 text-[11px]">
                Download a JSON archive of your rules, signatures, view preferences, and local customizations.
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="px-3 py-1.5 rounded bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-[#2d2d2d] text-neutral-700 dark:text-neutral-200 font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

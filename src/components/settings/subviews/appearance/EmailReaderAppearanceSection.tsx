'use client';

import React from 'react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';

export function EmailReaderAppearanceSection() {
  const smartDarkInvert = useGeneralSettingsStore((s) => s.smartDarkInvert ?? true);
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Email Reading View & HTML Content
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Control how formatted HTML email bodies are styled when viewing messages in Dark Mode.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 block">
              Smart Dark Mode for HTML Newsletters & Emails
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Adapts bright HTML background canvases into dark surfaces while preserving photos, logos, and signatures
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={smartDarkInvert}
              onChange={(e) => updateSettings({ smartDarkInvert: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-[#0078d4]" />
          </label>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { useUiStore } from '@/stores/useUiStore';

type Theme = 'dark' | 'light';

const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: 'dark', label: 'Dark Mode (Default)' },
  { value: 'light', label: 'Light Mode' },
];

export function AppearanceSettingsView() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  return (
    <div className="space-y-6 max-w-4xl text-neutral-800 dark:text-neutral-100">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b]">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Appearance</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Choose how AirSend looks. Changes apply immediately.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3 text-xs">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#0078d4]" />
          <span>Theme Preference</span>
        </h3>
        <div className="flex gap-4">
          {THEME_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="appTheme"
                checked={theme === option.value}
                onChange={() => setTheme(option.value)}
                className="accent-[#0078d4]"
              />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Eye, Keyboard, Sparkles, Save, Check, Type } from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';

export function AccessibilitySettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [reduceMotion, setReduceMotion] = useState(settings.reduceMotion ?? false);
  const [highContrast, setHighContrast] = useState(settings.highContrast ?? false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(settings.keyboardShortcuts ?? true);

  const handleSave = () => {
    updateSettings({
      reduceMotion,
      highContrast,
      keyboardShortcuts,
    });
    addToast({
      title: 'Accessibility settings saved',
      description: 'Your display and navigation preferences have been applied.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none pb-12">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Accessibility
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Customize motion, contrast, screen reader compatibility, and keyboard navigation.
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
              Turn off animations (Reduce motion)
            </span>
            <span className="text-neutral-500 text-[11px]">
              Minimizes transitions and sliding animations across folders, sidebars, and panels.
            </span>
          </div>
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
            className="w-4 h-4 accent-[#0078d4] rounded mt-0.5 cursor-pointer"
          />
        </label>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-start justify-between cursor-pointer">
          <label className="flex items-start justify-between w-full cursor-pointer">
            <div className="pr-4">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                High contrast borders & text
              </span>
              <span className="text-neutral-500 text-[11px]">
                Enhances border contrast and text legibility for improved visibility.
              </span>
            </div>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-4 h-4 accent-[#0078d4] rounded mt-0.5 cursor-pointer"
            />
          </label>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-start justify-between cursor-pointer">
          <label className="flex items-start justify-between w-full cursor-pointer">
            <div className="pr-4">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                Full keyboard shortcuts & focus rings
              </span>
              <span className="text-neutral-500 text-[11px]">
                Enables Outlook single-key shortcuts (J/K next/prev, E archive, # delete, R reply) and visible focus outlines.
              </span>
            </div>
            <input
              type="checkbox"
              checked={keyboardShortcuts}
              onChange={(e) => setKeyboardShortcuts(e.target.checked)}
              className="w-4 h-4 accent-[#0078d4] rounded mt-0.5 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

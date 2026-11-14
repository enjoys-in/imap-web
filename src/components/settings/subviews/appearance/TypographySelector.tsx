'use client';

import React from 'react';
import { useGeneralSettingsStore, FontSize, FontFamily } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

const FONT_SIZE_OPTIONS: readonly { value: FontSize; label: string; desc: string }[] = [
  { value: 'small', label: 'Small', desc: '85%' },
  { value: 'medium', label: 'Default', desc: '100%' },
  { value: 'large', label: 'Large', desc: '115%' },
];

const FONT_FAMILY_OPTIONS: readonly { value: FontFamily; label: string; sample: string }[] = [
  { value: 'system', label: 'Modern Sans', sample: 'Inter / System' },
  { value: 'serif', label: 'Editorial Serif', sample: 'Georgia / Serif' },
  { value: 'mono', label: 'Clean Monospace', sample: 'Monospace' },
];

export function TypographySelector() {
  const fontSize = useGeneralSettingsStore((s) => s.fontSize || 'medium');
  const fontFamily = useGeneralSettingsStore((s) => s.fontFamily || 'system');
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Typography & Text Size
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Adjust the overall interface text scale and reading typeface.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Font size */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
            Interface Text Scale
          </span>
          <div className="grid grid-cols-3 gap-2">
            {FONT_SIZE_OPTIONS.map((opt) => {
              const isSelected = fontSize === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => updateSettings({ fontSize: opt.value })}
                  className={cn(
                    'p-2 rounded-md border text-center transition-all cursor-pointer',
                    isSelected
                      ? 'border-[#0078d4] bg-[#0078d4]/10 dark:bg-[#0078d4]/15 font-semibold text-[#0078d4] dark:text-blue-400'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  )}
                >
                  <span className="text-xs block">{opt.label}</span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font family */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
            Reading Typeface
          </span>
          <div className="grid grid-cols-3 gap-2">
            {FONT_FAMILY_OPTIONS.map((opt) => {
              const isSelected = fontFamily === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => updateSettings({ fontFamily: opt.value })}
                  className={cn(
                    'p-2 rounded-md border text-center transition-all cursor-pointer',
                    isSelected
                      ? 'border-[#0078d4] bg-[#0078d4]/10 dark:bg-[#0078d4]/15 font-semibold text-[#0078d4] dark:text-blue-400'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  )}
                >
                  <span className="text-xs block">{opt.label}</span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5 truncate">{opt.sample}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useGeneralSettingsStore, HeaderTheme } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

interface HeaderThemeOption {
  id: HeaderTheme;
  label: string;
  gradientClass: string;
}

const HEADER_THEMES: readonly HeaderThemeOption[] = [
  {
    id: 'classic',
    label: 'Classic Navy',
    gradientClass: 'from-[#004578] via-[#005a9e] to-[#003056]',
  },
  {
    id: 'sunset',
    label: 'Sunset Glow',
    gradientClass: 'from-[#782800] via-[#9e3f00] to-[#560020]',
  },
  {
    id: 'ocean',
    label: 'Ocean Breeze',
    gradientClass: 'from-[#004d61] via-[#006680] to-[#002f3d]',
  },
  {
    id: 'circuit',
    label: 'Circuit Carbon',
    gradientClass: 'from-[#1f242b] via-[#2a303c] to-[#14171c]',
  },
  {
    id: 'aurora',
    label: 'Nordic Aurora',
    gradientClass: 'from-[#004d40] via-[#00695c] to-[#00332c]',
  },
];

export function HeaderThemeSelector() {
  const headerTheme = useGeneralSettingsStore((s) => s.headerTheme || 'classic');
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Top Navigation Bar Theme
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Choose a decorative header pattern or gradient for the top navigation bar.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {HEADER_THEMES.map((opt) => {
          const isSelected = headerTheme === opt.id;
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => updateSettings({ headerTheme: opt.id })}
              className={cn(
                'group flex flex-col items-center gap-1.5 p-1.5 rounded-lg border text-xs transition-all cursor-pointer',
                isSelected
                  ? 'border-[#0078d4] ring-2 ring-[#0078d4]/40 bg-[#0078d4]/5'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
              )}
            >
              <div
                className={cn(
                  'w-full h-8 rounded-md bg-gradient-to-r flex items-center justify-center shadow-xs',
                  opt.gradientClass
                )}
              >
                {isSelected && <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-sm" />}
              </div>
              <span
                className={cn(
                  'text-[11px] truncate',
                  isSelected ? 'font-semibold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

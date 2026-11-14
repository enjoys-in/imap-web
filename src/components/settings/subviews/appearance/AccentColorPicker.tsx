'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

export interface AccentOption {
  id: string;
  label: string;
  hex: string;
}

export const ACCENT_PALETTE: readonly AccentOption[] = [
  { id: 'blue', label: 'AirSend Blue', hex: '#0078d4' },
  { id: 'purple', label: 'Royal Purple', hex: '#5c2d91' },
  { id: 'teal', label: 'Teal', hex: '#008272' },
  { id: 'crimson', label: 'Crimson', hex: '#c30052' },
  { id: 'amber', label: 'Amber', hex: '#d83b01' },
  { id: 'graphite', label: 'Graphite', hex: '#484644' },
];

export function AccentColorPicker() {
  const accentColor = useGeneralSettingsStore((s) => s.accentColor || '#0078d4');
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  const handleSelect = (hex: string) => {
    updateSettings({ accentColor: hex });
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--accent-color', hex);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Accent Color
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Choose a primary highlight tint for buttons, badges, and active selections.
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 items-center">
        {ACCENT_PALETTE.map((color) => {
          const isSelected = accentColor.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              type="button"
              key={color.id}
              onClick={() => handleSelect(color.hex)}
              className={cn(
                'group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer',
                isSelected
                  ? 'border-neutral-900 dark:border-white ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-[#1a1a1a]'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
              )}
              title={color.label}
              aria-label={color.label}
            >
              <span
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
              </span>
              <span className="text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                {color.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

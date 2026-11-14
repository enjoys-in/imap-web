'use client';

import React from 'react';
import { AlignJustify, ListFilter, Check } from 'lucide-react';
import { useGeneralSettingsStore, DisplayDensity } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

interface DensityOption {
  value: DisplayDensity;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DENSITY_OPTIONS: readonly DensityOption[] = [
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'Generous row padding and relaxed reading space (Default)',
    icon: AlignJustify,
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Dense list rows designed to fit more emails on the screen',
    icon: ListFilter,
  },
];

export function DisplayDensitySelector() {
  const density = useGeneralSettingsStore((s) => s.density || 'comfortable');
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Display Density
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Control how compact or spacious email rows appear in your inbox list.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DENSITY_OPTIONS.map((opt) => {
          const isSelected = density === opt.value;
          const Icon = opt.icon;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => updateSettings({ density: opt.value })}
              className={cn(
                'relative p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5',
                isSelected
                  ? 'border-[#0078d4] bg-[#0078d4]/10 dark:bg-[#0078d4]/15 ring-1 ring-[#0078d4]'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] hover:border-neutral-400 dark:hover:border-neutral-700'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center',
                    isSelected
                      ? 'bg-[#0078d4] text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#0078d4]" />}
              </div>

              <div>
                <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 block">
                  {opt.label}
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                  {opt.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

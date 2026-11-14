'use client';

import React from 'react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';

type FirstDayOfWeek = 'Sunday' | 'Monday';
const WEEK_START_OPTIONS: readonly FirstDayOfWeek[] = ['Sunday', 'Monday'];

export function WeekStartCard() {
  const firstDayOfWeek = useGeneralSettingsStore((s) => s.firstDayOfWeek);
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <section className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] space-y-3">
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
        Week
      </h3>
      <div>
        <label htmlFor="first-day-of-week" className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 text-xs">
          First day of week
        </label>
        <select
          id="first-day-of-week"
          value={firstDayOfWeek}
          onChange={(e) => updateSettings({ firstDayOfWeek: e.target.value as FirstDayOfWeek })}
          className="w-full sm:w-80 h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors cursor-pointer"
        >
          {WEEK_START_OPTIONS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <p className="text-neutral-500 mt-1 text-xs">Saved automatically.</p>
      </div>
    </section>
  );
}

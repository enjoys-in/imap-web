'use client';

import React from 'react';
import { useGeneralSettingsStore, ReadingPaneLayout } from '@/stores/useGeneralSettingsStore';
import { ReadingPaneLayoutGrid } from '../ReadingPaneLayoutGrid';

export function ReadingPaneQuickSelector() {
  const readingPaneLayout = useGeneralSettingsStore((s) => s.readingPaneLayout || 'right');
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Reading Pane Layout
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Select where the message reading pane opens when viewing email conversations.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a]">
        <ReadingPaneLayoutGrid
          readingPaneLayout={readingPaneLayout}
          onSelectLayout={(layout: ReadingPaneLayout) => updateSettings({ readingPaneLayout: layout })}
        />
      </div>
    </div>
  );
}

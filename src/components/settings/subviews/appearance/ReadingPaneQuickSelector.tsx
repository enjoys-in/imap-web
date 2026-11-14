'use client';

import React from 'react';
import {
  useGeneralSettingsStore,
  ReadingPaneLayout,
  MessageOrder,
  AfterMoveOrDelete,
} from '@/stores/useGeneralSettingsStore';
import { ReadingPaneLayoutGrid } from '../ReadingPaneLayoutGrid';
import { ReadingPaneOrderGrid } from '../ReadingPaneOrderGrid';

export function ReadingPaneQuickSelector() {
  const readingPaneLayout = useGeneralSettingsStore((s) => s.readingPaneLayout || 'right');
  const messageOrder = useGeneralSettingsStore((s) => s.messageOrder || 'newestOnBottom');
  const afterMoveOrDelete = useGeneralSettingsStore((s) => s.afterMoveOrDelete || 'openNext');
  const showDeletedItems = useGeneralSettingsStore((s) => s.showDeletedItems ?? true);
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-5">
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

      <div className="space-y-2 pt-1">
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Message Conversation Order
        </h4>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          Choose whether newest messages appear at the top or bottom of a thread.
        </p>
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a]">
          <ReadingPaneOrderGrid
            messageOrder={messageOrder}
            onSelectOrder={(order: MessageOrder) => updateSettings({ messageOrder: order })}
          />
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          After Moving or Deleting
        </h4>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          What do you want to happen when you move or delete the item you are viewing?
        </p>
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] space-y-2">
          {[
            { id: 'openNext' as AfterMoveOrDelete, label: 'Open the next item' },
            { id: 'openPrevious' as AfterMoveOrDelete, label: 'Open the previous item' },
            { id: 'returnToList' as AfterMoveOrDelete, label: 'Return to the message list' },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            >
              <input
                type="radio"
                name="afterMoveOrDelete"
                checked={afterMoveOrDelete === item.id}
                onChange={() => updateSettings({ afterMoveOrDelete: item.id })}
                className="accent-[#0078d4] w-4 h-4 cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={showDeletedItems}
            onChange={(e) => updateSettings({ showDeletedItems: e.target.checked })}
            className="accent-[#0078d4] w-4 h-4 rounded"
          />
          <span className="font-medium">Show deleted items in conversations</span>
        </label>
      </div>
    </div>
  );
}

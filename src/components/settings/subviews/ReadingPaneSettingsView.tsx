'use client';

import React, { useState } from 'react';
import {
  useGeneralSettingsStore,
  ReadingPaneLayout,
  MessageOrder,
  AfterMoveOrDelete,
} from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { Check } from 'lucide-react';
import { ReadingPaneLayoutGrid } from './ReadingPaneLayoutGrid';
import { ReadingPaneOrderGrid } from './ReadingPaneOrderGrid';

export function ReadingPaneSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [readingPaneLayout, setReadingPaneLayout] = useState<ReadingPaneLayout>(
    settings.readingPaneLayout || 'right'
  );
  const [messageOrder, setMessageOrder] = useState<MessageOrder>(
    settings.messageOrder || 'newestOnBottom'
  );
  const [afterMoveOrDelete, setAfterMoveOrDelete] = useState<AfterMoveOrDelete>(
    settings.afterMoveOrDelete || 'openNext'
  );
  const [showDeletedItems, setShowDeletedItems] = useState<boolean>(
    settings.showDeletedItems ?? true
  );

  const handleSelectLayout = (layout: ReadingPaneLayout) => {
    setReadingPaneLayout(layout);
    updateSettings({ readingPaneLayout: layout });
    addToast({
      title: 'Layout Updated',
      description: `Reading pane layout set to "${layout}".`,
      type: 'success',
    });
  };

  const handleSelectOrder = (order: MessageOrder) => {
    setMessageOrder(order);
    updateSettings({ messageOrder: order });
    addToast({
      title: 'Message Order Updated',
      description: `Conversations ordered with ${order === 'newestOnTop' ? 'newest messages on top' : 'newest messages on bottom'}.`,
      type: 'success',
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      readingPaneLayout,
      messageOrder,
      afterMoveOrDelete,
      showDeletedItems,
    });
    addToast({
      title: 'Reading Pane Settings Saved',
      description: 'Your layout, conversation ordering, and post-action preferences have been saved.',
      type: 'success',
    });
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 max-w-4xl text-neutral-800 dark:text-neutral-100">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Reading Pane</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Customize reading pane placement, conversation order, and move/delete behavior.
          </p>
        </div>
        <button
          type="submit"
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-6 text-xs">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block">
            Do you want to see deleted items in your conversations?
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={showDeletedItems}
              onChange={(e) => {
                setShowDeletedItems(e.target.checked);
                updateSettings({ showDeletedItems: e.target.checked });
              }}
              className="accent-[#0078d4] w-4 h-4 rounded"
            />
            <span className="font-medium">Show deleted items</span>
          </label>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Layout</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              How do you want your reading pane to be laid out?
            </p>
          </div>
          <ReadingPaneLayoutGrid readingPaneLayout={readingPaneLayout} onSelectLayout={handleSelectLayout} />
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">How do you want your messages to be ordered?</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              This setting is not available when &quot;Show only selected message&quot; is chosen for the reading pane
            </p>
          </div>
          <ReadingPaneOrderGrid messageOrder={messageOrder} onSelectOrder={handleSelectOrder} />
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-neutral-900 dark:text-white block">
            What do you want to happen when you move or delete the item you are viewing?
          </label>
          <div className="space-y-2">
            {[
              { id: 'openNext' as const, label: 'Open the next item' },
              { id: 'openPrevious' as const, label: 'Open the previous item' },
              { id: 'returnToList' as const, label: 'Return to the message list' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
              >
                <input
                  type="radio"
                  name="afterMoveOrDelete"
                  checked={afterMoveOrDelete === item.id}
                  onChange={() => {
                    setAfterMoveOrDelete(item.id);
                    updateSettings({ afterMoveOrDelete: item.id });
                  }}
                  className="accent-[#0078d4] w-4 h-4 cursor-pointer"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

'use client';

import React from 'react';
import { useGeneralSettingsStore, PreviewLines } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

const PREVIEW_LINE_OPTIONS: readonly { value: PreviewLines; label: string }[] = [
  { value: 0, label: 'Off' },
  { value: 1, label: '1 Line' },
  { value: 2, label: '2 Lines' },
  { value: 3, label: '3 Lines' },
];

export function MessageListAppearanceSection() {
  const previewLines = useGeneralSettingsStore((s) => s.previewLines ?? 1);
  const showAvatars = useGeneralSettingsStore((s) => s.showAvatars ?? true);
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Message List Appearance
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Configure how email summaries, snippet previews, and sender details look in your list.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] space-y-4">
        {/* Preview snippet lines */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 block">
              Snippet Preview Text
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Lines of message preview shown underneath the subject
            </span>
          </div>

          <div className="flex rounded-md border border-neutral-300 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-neutral-800 shrink-0">
            {PREVIEW_LINE_OPTIONS.map((opt) => {
              const isSelected = previewLines === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => updateSettings({ previewLines: opt.value })}
                  className={cn(
                    'px-3 py-1 text-xs rounded font-medium transition-all cursor-pointer',
                    isSelected
                      ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-white shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sender avatars toggle */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="pr-4">
            <span className="font-medium text-xs text-neutral-800 dark:text-neutral-200 block">
              Sender Avatars
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Show sender initials and profile pictures in the message list
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={showAvatars}
              onChange={(e) => updateSettings({ showAvatars: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-[#0078d4]" />
          </label>
        </div>
      </div>
    </div>
  );
}

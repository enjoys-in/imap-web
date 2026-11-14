'use client';

import React from 'react';
import { useGeneralSettingsStore, SenderProminence, DateDisplayFormat, UnreadIndicatorStyle } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

export function MessageListStylingSection() {
  const senderProminence = useGeneralSettingsStore((s) => s.senderProminence || 'senderFirst');
  const dateDisplayFormat = useGeneralSettingsStore((s) => s.dateDisplayFormat || 'relative');
  const unreadIndicatorStyle = useGeneralSettingsStore((s) => s.unreadIndicatorStyle || 'dot');
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Message Styling & Information Prominence
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Configure headline emphasis, timestamps, and unread visual cues.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Prominence */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
            Row Headline
          </span>
          <div className="space-y-1">
            {[
              { id: 'senderFirst' as SenderProminence, label: 'Sender First', desc: 'Emphasize sender name' },
              { id: 'subjectFirst' as SenderProminence, label: 'Subject First', desc: 'Emphasize subject line' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-md border cursor-pointer text-xs transition-all',
                  senderProminence === opt.id
                    ? 'border-[#0078d4] bg-[#0078d4]/5 text-neutral-900 dark:text-white font-medium'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                )}
              >
                <input
                  type="radio"
                  name="senderProminence"
                  checked={senderProminence === opt.id}
                  onChange={() => updateSettings({ senderProminence: opt.id })}
                  className="accent-[#0078d4]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date format */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
            Date & Timestamp
          </span>
          <div className="space-y-1">
            {[
              { id: 'relative' as DateDisplayFormat, label: 'Relative Time', desc: 'e.g. 5m ago, Yesterday' },
              { id: 'absolute' as DateDisplayFormat, label: 'Exact Date', desc: 'e.g. 10:42 AM, 11/14/2026' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-md border cursor-pointer text-xs transition-all',
                  dateDisplayFormat === opt.id
                    ? 'border-[#0078d4] bg-[#0078d4]/5 text-neutral-900 dark:text-white font-medium'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                )}
              >
                <input
                  type="radio"
                  name="dateDisplayFormat"
                  checked={dateDisplayFormat === opt.id}
                  onChange={() => updateSettings({ dateDisplayFormat: opt.id })}
                  className="accent-[#0078d4]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Unread indicator */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
            Unread Indicator
          </span>
          <div className="space-y-1">
            {[
              { id: 'dot' as UnreadIndicatorStyle, label: 'Accent Dot', desc: 'Colored dot' },
              { id: 'border' as UnreadIndicatorStyle, label: 'Left Stripe', desc: 'Border bar' },
              { id: 'bold' as UnreadIndicatorStyle, label: 'Bold Only', desc: 'Text only' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-md border cursor-pointer text-xs transition-all',
                  unreadIndicatorStyle === opt.id
                    ? 'border-[#0078d4] bg-[#0078d4]/5 text-neutral-900 dark:text-white font-medium'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                )}
              >
                <input
                  type="radio"
                  name="unreadIndicatorStyle"
                  checked={unreadIndicatorStyle === opt.id}
                  onChange={() => updateSettings({ unreadIndicatorStyle: opt.id })}
                  className="accent-[#0078d4]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

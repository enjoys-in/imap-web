'use client';

import React from 'react';
import { Layout, Columns2, Rows2, Maximize, ExternalLink, Check } from 'lucide-react';
import { useGeneralSettingsStore, ReadingPaneLayout } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

interface MailSortLayoutOptionsProps {
  onSelect: () => void;
}

const LAYOUTS: { id: ReadingPaneLayout; label: string; icon: React.ElementType }[] = [
  { id: 'right', label: 'Right', icon: Columns2 },
  { id: 'bottom', label: 'Bottom', icon: Rows2 },
  { id: 'fillScreen', label: 'Fill screen', icon: Maximize },
  { id: 'popoutOnly', label: 'Popout only', icon: ExternalLink },
];

export function MailSortLayoutOptions({ onSelect }: MailSortLayoutOptionsProps) {
  const readingPaneLayout = useGeneralSettingsStore((s) => s.readingPaneLayout);
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  const handleSelect = (layout: ReadingPaneLayout) => {
    updateSettings({ readingPaneLayout: layout });
    onSelect();
  };

  return (
    <>
      <div className="my-1 border-t border-neutral-200 dark:border-neutral-700/80" />
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
        <Layout className="w-3 h-3 text-[#0078d4]" />
        <span>Reading Pane Layout</span>
      </div>

      {LAYOUTS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleSelect(id)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer',
            readingPaneLayout === id
              ? 'text-[#0078d4] dark:text-blue-400 font-semibold bg-neutral-50 dark:bg-neutral-800/60'
              : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
          )}
        >
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </div>
          {readingPaneLayout === id && <Check className="w-3.5 h-3.5 text-[#0078d4] dark:text-blue-400" />}
        </button>
      ))}
    </>
  );
}

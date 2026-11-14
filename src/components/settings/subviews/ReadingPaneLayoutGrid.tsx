import React from 'react';
import { ReadingPaneLayout } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

export const LAYOUT_OPTIONS: { id: ReadingPaneLayout; label: string }[] = [
  { id: 'right', label: 'Right' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'fillScreen', label: 'Fill screen' },
  { id: 'popoutOnly', label: 'Popout only' },
];

export function ReadingPaneLayoutGrid({
  readingPaneLayout,
  onSelectLayout,
}: {
  readingPaneLayout: ReadingPaneLayout;
  onSelectLayout: (l: ReadingPaneLayout) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {LAYOUT_OPTIONS.map((opt) => {
        const isSelected = readingPaneLayout === opt.id;
        return (
          <button
            type="button"
            key={opt.id}
            onClick={() => onSelectLayout(opt.id)}
            className="flex flex-col items-center gap-2 text-center group cursor-pointer focus:outline-none"
          >
            <div
              className={cn(
                'w-full aspect-[4/3] rounded-lg p-1.5 flex flex-col gap-1 transition-all bg-neutral-900 border border-neutral-700 shadow-sm overflow-hidden',
                isSelected ? 'border-2 border-[#0078d4] ring-2 ring-[#0078d4]/40 bg-[#161616]' : 'group-hover:border-neutral-500'
              )}
            >
              <div className="h-2 w-full bg-neutral-700/80 rounded-xs shrink-0" />
              <div className="flex-1 flex gap-1 min-h-0 relative">
                <div className="w-1/4 h-full bg-neutral-800 rounded-xs shrink-0" />
                {opt.id === 'right' && (
                  <>
                    <div className="w-1/3 h-full bg-neutral-800 rounded-xs shrink-0" />
                    <div className="flex-1 h-full bg-[#0078d4] rounded-xs" />
                  </>
                )}
                {opt.id === 'bottom' && (
                  <div className="flex-1 flex flex-col gap-1 h-full min-h-0">
                    <div className="flex-1 bg-neutral-800 rounded-xs" />
                    <div className="h-1/2 bg-[#0078d4] rounded-xs shrink-0" />
                  </div>
                )}
                {opt.id === 'fillScreen' && <div className="flex-1 h-full bg-[#0078d4] rounded-xs" />}
                {opt.id === 'popoutOnly' && (
                  <>
                    <div className="flex-1 h-full bg-neutral-800 rounded-xs" />
                    <div className="absolute inset-x-3 inset-y-2.5 bg-[#0078d4] rounded border border-white/50 shadow-md flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    </div>
                  </>
                )}
              </div>
            </div>
            <span
              className={cn(
                'text-xs transition-colors',
                isSelected ? 'font-bold text-[#0078d4] dark:text-blue-400' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white'
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';
import { MessageOrder } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

export const ORDER_OPTIONS: { id: MessageOrder; label: string }[] = [
  { id: 'newestOnTop', label: 'Newest on top' },
  { id: 'newestOnBottom', label: 'Newest on bottom' },
];

export function ReadingPaneOrderGrid({
  messageOrder,
  onSelectOrder,
}: {
  messageOrder: MessageOrder;
  onSelectOrder: (o: MessageOrder) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {ORDER_OPTIONS.map((opt) => {
        const isSelected = messageOrder === opt.id;
        return (
          <button
            type="button"
            key={opt.id}
            onClick={() => onSelectOrder(opt.id)}
            className="flex flex-col items-center gap-2 text-center group cursor-pointer focus:outline-none"
          >
            <div
              className={cn(
                'w-full aspect-[4/3] rounded-lg p-1.5 flex flex-col gap-1 transition-all bg-neutral-900 border border-neutral-700 shadow-sm overflow-hidden',
                isSelected ? 'border-2 border-[#0078d4] ring-2 ring-[#0078d4]/40 bg-[#161616]' : 'group-hover:border-neutral-500'
              )}
            >
              <div className="h-2 w-full bg-neutral-700/80 rounded-xs shrink-0" />
              <div className="flex-1 flex gap-1 min-h-0">
                <div className="w-1/3 h-full bg-neutral-800 rounded-xs shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-0.5 min-h-0">
                  {opt.id === 'newestOnTop' ? (
                    <>
                      <div className="h-3 w-full bg-[#0078d4] rounded-xs shrink-0" />
                      <div className="h-2 w-full bg-neutral-800 rounded-xs shrink-0" />
                      <div className="h-2 w-full bg-neutral-800 rounded-xs shrink-0" />
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-full bg-neutral-800 rounded-xs shrink-0" />
                      <div className="h-2 w-full bg-neutral-800 rounded-xs shrink-0" />
                      <div className="h-3 w-full bg-[#0078d4] rounded-xs shrink-0" />
                    </>
                  )}
                </div>
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

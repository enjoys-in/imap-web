'use client';

import React from 'react';
import { MailMessageMetadata, MailMessage } from '@/types';
import { cn } from '@/lib/utils';
import { formatDisplayDate } from '@/lib/dateUtils';
import { CornerDownRight, Check } from 'lucide-react';

interface MailThreadSubItemsProps {
  subEmails: (MailMessageMetadata | MailMessage)[];
  activeId?: string | null;
  selectedIds: string[];
  isExpanded?: boolean;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
}

export function MailThreadSubItems({
  subEmails,
  activeId,
  selectedIds,
  isExpanded = true,
  onSelect,
  onToggleCheck,
}: MailThreadSubItemsProps) {
  if (!subEmails || subEmails.length === 0) return null;
  const selectedSet = new Set(selectedIds);

  return (
    <div
      className={cn(
        'grid transition-all duration-300 ease-in-out',
        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
      )}
    >
      <div className="overflow-hidden">
        <div className="bg-neutral-50/70 dark:bg-[#181818]/80 border-b border-neutral-200 dark:border-neutral-800/80">
          {subEmails.map((msg) => {
            const isSelected = msg.id === activeId;
            const isChecked = selectedSet.has(msg.id);
            const dateFormatted = formatDisplayDate(msg.date);

            return (
              <div
                key={msg.id}
                onClick={() => onSelect(msg.id)}
                className={cn(
                  'flex items-center gap-2 pl-7 pr-3 py-1.5 cursor-pointer text-xs border-l-2 transition-colors',
                  isSelected
                    ? 'bg-[#c7e0f4]/50 dark:bg-[#2e2e2e] border-l-[#0078d4] text-neutral-900 dark:text-white'
                    : 'hover:bg-neutral-100 dark:hover:bg-[#252525] border-l-neutral-300 dark:border-l-neutral-700 text-neutral-700 dark:text-neutral-300'
                )}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheck(msg.id);
                  }}
                  className="w-3.5 h-3.5 rounded border border-neutral-400 dark:border-neutral-600 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {isChecked && <Check className="w-2.5 h-2.5 text-[#0078d4] stroke-[3]" />}
                </div>

                <CornerDownRight className="w-3 h-3 text-neutral-400 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={cn('truncate text-[11px]', !msg.isRead ? 'font-bold text-neutral-900 dark:text-white' : 'font-medium')}>
                      {msg.fromName || msg.fromAddress}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 shrink-0 font-medium">{dateFormatted}</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{msg.preview || msg.subject}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

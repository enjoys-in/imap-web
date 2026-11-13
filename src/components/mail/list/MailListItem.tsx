'use client';

import React from 'react';
import {
  Paperclip,
  Pin,
  CornerUpLeft,
  ChevronRight,
  ArrowDown,
  Check,
} from 'lucide-react';
import { MailMessage, MailMessageMetadata } from '@/types';
import { cn } from '@/lib/utils';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { formatDisplayDate } from '@/lib/dateUtils';
import { MailListItemHoverActions } from './MailListItemHoverActions';

interface MailListItemProps {
  email: MailMessageMetadata | MailMessage;
  isSelected: boolean;
  isChecked: boolean;
  hasAnySelection?: boolean;
  isThread?: boolean;
  isThreadExpanded?: boolean;
  cardsRows?: 2 | 3;
  onSelect: (id: string) => void;
  onToggleCheck: (id: string) => void;
  onToggleFlag: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleThreadExpand?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, email: MailMessageMetadata | MailMessage) => void;
}

export const MailListItem = React.memo(function MailListItem({
  email, isSelected, isChecked, hasAnySelection = false, isThread, isThreadExpanded = false, cardsRows = 3,
  onSelect, onToggleCheck, onToggleFlag, onTogglePin, onToggleRead, onDelete, onToggleThreadExpand, onContextMenu,
}: MailListItemProps) {
  const dateFormatted = formatDisplayDate(email.date);
  const hasThread = Boolean(isThread ?? (email.isThread || (email.threadCount && email.threadCount > 1)));
  const hasDownloadIcon = email.fromName.includes('Human') || email.fromName.includes('Oracle');

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', email.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(email.id)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, email)}
      className={cn(
        'group relative flex items-start gap-2 px-3 py-2 cursor-pointer border-b select-none transition-colors text-xs',
        'border-neutral-200 dark:border-neutral-800/80',
        isChecked
          ? 'bg-[#c7e0f4]/80 text-neutral-900 border-l-2 border-[#0078d4] dark:bg-[#003865] dark:text-white dark:border-l-2 dark:border-[#0078d4] shadow-xs'
          : isSelected
          ? 'bg-[#c7e0f4]/50 text-neutral-900 border-l-2 border-[#0078d4] dark:bg-[#333333] dark:text-white dark:border-l-0 shadow-xs'
          : 'bg-white hover:bg-neutral-100/90 text-neutral-700 dark:bg-[#1f1f1f] dark:hover:bg-[#282828] dark:text-neutral-300',
        email.isPinned && !isSelected && !isChecked && 'bg-neutral-50 dark:bg-[#222222]'
      )}
    >
      {/* Left Chevron / Checkbox / Avatar */}
      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
        {hasThread && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleThreadExpand) onToggleThreadExpand(email.id);
            }}
            className="p-0.5 -ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer rounded"
            title={isThreadExpanded ? 'Collapse conversation' : 'Expand conversation'}
          >
            <ChevronRight className={cn('w-3.5 h-3.5 transition-transform duration-150', isThreadExpanded && 'rotate-90 text-[#0078d4]')} />
          </button>
        )}

        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck(email.id);
          }}
          className="cursor-pointer"
        >
          {isChecked ? (
            <div className="w-5 h-5 rounded bg-[#0078d4] flex items-center justify-center text-white shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          ) : hasAnySelection ? (
            <div className="w-5 h-5 rounded border-2 border-neutral-400 dark:border-neutral-500 hover:border-[#0078d4] dark:hover:border-blue-400 flex items-center justify-center transition-colors" />
          ) : (
            <div className="relative group/check">
              <BimiAvatar name={email.fromName || email.fromAddress} email={email.fromAddress} explicitLogo={email.bimiLogoUrl} size="md" />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/check:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-3.5 h-3.5 rounded border border-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span
            className={cn(
              'truncate text-xs',
              !email.isRead ? 'font-bold text-neutral-900 dark:text-white' : 'font-semibold text-neutral-700 dark:text-neutral-200'
            )}
          >
            {email.fromName || email.fromAddress}
          </span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0 font-medium">{dateFormatted}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className={cn(
              'truncate text-xs',
              !email.isRead ? 'font-semibold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'
            )}
          >
            {email.subject}
          </span>
        </div>

        {cardsRows !== 2 && (
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
            {email.preview}
          </p>
        )}
      </div>

      {/* Trailing Icons */}
      <div className="flex flex-col items-end justify-between self-stretch shrink-0 pt-0.5 pl-1">
        <div className="flex items-center gap-1 text-neutral-400">
          {email.isPinned && (
            <Pin className="w-3.5 h-3.5 fill-[#0078d4] text-[#0078d4] dark:fill-white dark:text-white rotate-45" />
          )}
          {email.hasAttachments && (
            <Paperclip className="w-3.5 h-3.5 text-neutral-400" />
          )}
          {email.isAnswered && (
            <CornerUpLeft className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          )}
          {hasDownloadIcon && (
            <ArrowDown className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
          )}
        </div>
      </div>

      <MailListItemHoverActions
        id={email.id}
        isRead={email.isRead}
        isPinned={email.isPinned}
        isFlagged={email.isFlagged}
        onToggleRead={onToggleRead}
        onTogglePin={onTogglePin}
        onToggleFlag={onToggleFlag}
        onDelete={onDelete}
      />
    </div>
  );
});

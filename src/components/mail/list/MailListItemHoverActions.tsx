'use client';

import React from 'react';
import { Mail, MailOpen, Pin, Flag, Trash2, FolderInput, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGeneralSettingsStore, QuickActionType } from '@/stores/useGeneralSettingsStore';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';

interface HoverActionsProps {
  id: string;
  isRead: boolean;
  isPinned?: boolean;
  isFlagged?: boolean;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFlag: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onMove?: (id: string) => void;
}

export const MailListItemHoverActions = React.memo(function MailListItemHoverActions({
  id,
  isRead,
  isPinned,
  isFlagged,
  onToggleRead,
  onTogglePin,
  onToggleFlag,
  onDelete,
  onArchive,
  onMove,
}: HoverActionsProps) {
  const quickActions = useGeneralSettingsStore((s) => s.quickActions) || [
    'flag',
    'pin',
    'delete',
  ];

  if (!quickActions || quickActions.length === 0) {
    return null;
  }

  const handleArchive = () => {
    if (onArchive) {
      onArchive(id);
    } else {
      dispatchMailAction({ action: 'archive', targetEmailId: id });
    }
  };

  const handleMove = () => {
    if (onMove) {
      onMove(id);
    } else {
      dispatchMailAction({ action: 'move-to', targetEmailId: id });
    }
  };

  return (
    <div
      className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white dark:bg-[#2b2b2b] border border-neutral-200 dark:border-neutral-700/80 rounded px-1.5 py-0.5 shadow-md z-10 text-neutral-600 dark:text-neutral-300 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Move to a folder */}
      {quickActions.includes('move') && (
        <button
          onClick={handleMove}
          className="p-1 hover:text-[#0078d4] text-neutral-600 dark:text-neutral-300 cursor-pointer transition-colors"
          title="Move to a folder"
        >
          <FolderInput className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 2. Mark as read / unread */}
      {quickActions.includes('read') && (
        <button
          onClick={() => onToggleRead(id)}
          className="p-1 hover:text-[#0078d4] text-neutral-600 dark:text-neutral-300 cursor-pointer transition-colors"
          title={isRead ? 'Mark as unread' : 'Mark as read'}
        >
          {isRead ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* 3. Flag */}
      {quickActions.includes('flag') && (
        <button
          onClick={() => onToggleFlag(id)}
          className={cn(
            'p-1 hover:text-red-500 cursor-pointer transition-colors',
            isFlagged ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-300'
          )}
          title="Flag"
        >
          <Flag className="w-3.5 h-3.5 fill-current" />
        </button>
      )}

      {/* 4. Pin */}
      {quickActions.includes('pin') && (
        <button
          onClick={() => onTogglePin(id)}
          className={cn(
            'p-1 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors',
            isPinned ? 'text-[#0078d4] dark:text-white' : 'text-neutral-600 dark:text-neutral-300'
          )}
          title={isPinned ? 'Unpin' : 'Pin to top'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 5. Archive */}
      {quickActions.includes('archive') && (
        <button
          onClick={handleArchive}
          className="p-1 hover:text-amber-500 text-neutral-600 dark:text-neutral-300 cursor-pointer transition-colors"
          title="Archive"
        >
          <Archive className="w-3.5 h-3.5" />
        </button>
      )}

      {/* 6. Delete */}
      {quickActions.includes('delete') && (
        <button
          onClick={() => onDelete(id)}
          className="p-1 hover:text-red-500 text-neutral-600 dark:text-neutral-300 cursor-pointer transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});

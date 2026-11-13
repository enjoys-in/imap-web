'use client';

import React, { useState } from 'react';
import {
  Inbox,
  Send,
  FileEdit,
  Archive,
  AlertOctagon,
  Trash2,
  Folder as FolderIcon,
  MessageSquare,
  Bookmark,
  FileText,
  Users,
} from 'lucide-react';
import { MailFolder, SpecialFolder } from '@/types';
import { cn } from '@/lib/utils';

interface FolderItemProps {
  folder: MailFolder;
  isSelected: boolean;
  onSelect: (folderId: string) => void;
  onContextMenu?: (e: React.MouseEvent, folder: MailFolder) => void;
  onDropEmail?: (emailId: string, folderId: string) => void;
}

function getFolderIcon(displayName: string, special: SpecialFolder) {
  const name = displayName.toLowerCase();
  if (name.includes('conversation')) return MessageSquare;
  if (name.includes('important')) return Bookmark;
  if (name.includes('notes')) return FileText;
  if (name.includes('group')) return Users;

  switch (special) {
    case 'Inbox':
      return Inbox;
    case 'Sent':
      return Send;
    case 'Drafts':
      return FileEdit;
    case 'Archive':
      return Archive;
    case 'Junk':
      return AlertOctagon;
    case 'Trash':
      return Trash2;
    default:
      return FolderIcon;
  }
}

export const FolderItem = React.memo(function FolderItem({
  folder,
  isSelected,
  onSelect,
  onContextMenu,
  onDropEmail,
}: FolderItemProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const Icon = getFolderIcon(folder.displayName, folder.special);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const emailId = e.dataTransfer.getData('text/plain');
    if (emailId && onDropEmail) {
      onDropEmail(emailId, folder.id);
    }
  };

  return (
    <button
      onClick={() => onSelect(folder.id)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, folder)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-all text-left select-none group',
        isSelected
          ? 'bg-[#c7e0f4] text-[#0078d4] font-semibold dark:bg-neutral-800 dark:text-white shadow-xs'
          : 'text-neutral-700 hover:bg-neutral-200/70 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white',
        isDragOver && 'border-2 border-dashed border-[#0078d4] bg-blue-100/50 dark:bg-blue-950/40 text-[#0078d4]'
      )}
    >
      <div className="flex items-center gap-2.5 truncate">
        <Icon
          className={cn(
            'w-4 h-4 shrink-0 transition-colors',
            isSelected
              ? 'text-[#0078d4] dark:text-white'
              : 'text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200'
          )}
        />
        <span className="truncate">{folder.displayName}</span>
      </div>

      {folder.unreadCount > 0 && (
        <span
          className={cn(
            'text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0 transition-colors',
            isSelected
              ? 'bg-[#0078d4] text-white dark:bg-neutral-700 dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          )}
        >
          {folder.displayName === 'Notes' ? `[${folder.unreadCount}]` : folder.unreadCount}
        </span>
      )}
    </button>
  );
});

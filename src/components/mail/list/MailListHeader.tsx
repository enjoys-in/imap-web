'use client';

import React from 'react';
import {
  CheckSquare,
  MinusSquare,
  Square,
  Star,
  ArrowUpDown,
  ListFilter,
  ChevronDown,
} from 'lucide-react';
import { useMailStore } from '@/stores';

interface MailListHeaderProps {
  totalEmailsCount: number;
  currentEmailIds: string[];
}

export function MailListHeader({ totalEmailsCount, currentEmailIds }: MailListHeaderProps) {
  const selectedIds = useMailStore((s) => s.selectedIds);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const selectAllIds = useMailStore((s) => s.selectAllIds);
  const clearSelectedIds = useMailStore((s) => s.clearSelectedIds);

  const isAllSelected = currentEmailIds.length > 0 && selectedIds.length === currentEmailIds.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectToggle = () => {
    if (isAllSelected) {
      clearSelectedIds();
    } else {
      selectAllIds(currentEmailIds);
    }
  };

  const folderTitle = selectedFolderId === 'fld-archive' ? 'Archive' :
    selectedFolderId === 'fld-sent' ? 'Sent Items' :
    selectedFolderId === 'fld-drafts' ? 'Drafts' :
    selectedFolderId === 'fld-deleted' ? 'Deleted Items' :
    selectedFolderId === 'fld-junk' ? 'Junk Email' : 'Inbox';

  return (
    <div className="h-10 border-b border-neutral-200 dark:border-neutral-800 px-3 flex items-center justify-between shrink-0 select-none bg-neutral-50 dark:bg-[#1f1f1f] text-neutral-700 dark:text-neutral-300 transition-colors">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSelectToggle}
          className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
          title={isAllSelected ? 'Deselect all' : 'Select all'}
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-[#0078d4]" />
          ) : isSomeSelected ? (
            <MinusSquare className="w-4 h-4 text-[#0078d4]" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 dark:text-white">
          <span>{folderTitle}</span>
          <Star className="w-3.5 h-3.5 text-neutral-400 hover:text-amber-500 cursor-pointer transition-colors" />
        </div>
      </div>

      <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 text-xs">
        <button className="hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer" title="Sort order">
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
        <button className="hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer" title="Filter emails">
          <ListFilter className="w-3.5 h-3.5" />
        </button>
        <button className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
          <span>By Date</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

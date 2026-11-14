'use client';

import React from 'react';
import {
  CheckSquare, MinusSquare, Square, Star, ArrowUpDown, ChevronDown, Paperclip, Pin, Flag, Mail
} from 'lucide-react';
import { useMailStore, MailFilterTab } from '@/stores';
import { cn } from '@/lib/utils';
import { getRegisteredFolder } from '@/lib/folders';

import { MailSortMenu } from './MailSortMenu';

interface MailListHeaderProps {
  totalEmailsCount: number;
  currentEmailIds: string[];
  isWideLayout?: boolean;
}

export function MailListHeader({ totalEmailsCount, currentEmailIds, isWideLayout = false }: MailListHeaderProps) {
  const selectedIds = useMailStore((s) => s.selectedIds);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const filterTab = useMailStore((s) => s.filterTab);
  const setFilterTab = useMailStore((s) => s.setFilterTab);
  const selectAllIds = useMailStore((s) => s.selectAllIds);
  const clearSelectedIds = useMailStore((s) => s.clearSelectedIds);

  const isAllSelected = currentEmailIds.length > 0 && selectedIds.length === currentEmailIds.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectToggle = () => {
    if (isAllSelected) clearSelectedIds();
    else selectAllIds(currentEmailIds);
  };

  // The title is the backend folder's own name (normalized for display).
  const folderTitle = getRegisteredFolder(selectedFolderId)?.displayName ?? '';

  const filterTabs: { id: MailFilterTab; label: string; icon?: React.ElementType }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'flagged', label: 'Flagged', icon: Flag },
    { id: 'attachments', label: 'Files', icon: Paperclip },
    { id: 'pinned', label: 'Pinned', icon: Pin },
  ];

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 shrink-0 select-none bg-neutral-50 dark:bg-[#1f1f1f] text-neutral-700 dark:text-neutral-300 transition-colors">
      {/* Top Row: Select All & Folder Title */}
      <div className="h-9 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectToggle}
            className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
            title={isAllSelected ? 'Deselect all' : 'Select all'}
          >
            {isAllSelected ? <CheckSquare className="w-4 h-4 text-[#0078d4]" /> : isSomeSelected ? <MinusSquare className="w-4 h-4 text-[#0078d4]" /> : <Square className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 dark:text-white">
            <span>{folderTitle}</span>
            <span className="text-[10px] font-normal text-neutral-400">({totalEmailsCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs">
          <MailSortMenu />
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div className="px-3 pb-2 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
        {filterTabs.map((tab) => {
          const isActive = filterTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={cn(
                'h-6 px-2 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0',
                isActive
                  ? 'bg-[#0078d4] text-white shadow-2xs'
                  : 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300/70 dark:hover:bg-neutral-700/80 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              {Icon && <Icon className="w-3 h-3" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabular Column Header Bar (For Wide Layouts: Fill screen / Popout only) */}
      {isWideLayout && (
        <div className="h-7 px-3 bg-neutral-100/70 dark:bg-[#181818] border-t border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center select-none">
          <div className="w-8 shrink-0" />
          <div className="w-48 sm:w-64 shrink-0 font-medium text-neutral-600 dark:text-neutral-400">
            From
          </div>
          <div className="flex-1 min-w-0 font-medium text-neutral-600 dark:text-neutral-400">
            Subject
          </div>
          <div className="w-24 text-right font-medium text-neutral-600 dark:text-neutral-400 flex items-center justify-end gap-1">
            <span>Received</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      )}
    </div>
  );
}

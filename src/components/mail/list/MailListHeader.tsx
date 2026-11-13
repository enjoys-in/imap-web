'use client';

import React from 'react';
import {
  CheckSquare, MinusSquare, Square, Star, ArrowUpDown, ChevronDown, Paperclip, Pin, Flag, Mail
} from 'lucide-react';
import { useMailStore, MailFilterTab } from '@/stores';
import { cn } from '@/lib/utils';

interface MailListHeaderProps {
  totalEmailsCount: number;
  currentEmailIds: string[];
}

export function MailListHeader({ totalEmailsCount, currentEmailIds }: MailListHeaderProps) {
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

  const folderTitle = selectedFolderId === 'fld-archive' ? 'Archive' :
    selectedFolderId === 'fld-sent' ? 'Sent Items' :
    selectedFolderId === 'fld-drafts' ? 'Drafts' :
    selectedFolderId === 'fld-deleted' ? 'Deleted Items' :
    selectedFolderId === 'fld-junk' ? 'Junk Email' : 'Inbox';

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
          <button className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
            <span>By Date</span>
            <ChevronDown className="w-3 h-3" />
          </button>
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
    </div>
  );
}

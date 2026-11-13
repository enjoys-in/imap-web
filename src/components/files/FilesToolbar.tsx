'use client';

import React from 'react';
import { Search, LayoutGrid, List, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileType } from './useFilesState';

interface FilesToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: FileType;
  onSelectType: (type: FileType) => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  filesCount: number;
}

export function FilesToolbar({
  searchQuery,
  onSearchChange,
  selectedType,
  onSelectType,
  viewMode,
  onToggleViewMode,
  filesCount,
}: FilesToolbarProps) {
  const TYPES: { id: FileType; label: string }[] = [
    { id: 'all', label: 'All Types' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'doc', label: 'Documents' },
    { id: 'spreadsheet', label: 'Spreadsheets' },
    { id: 'image', label: 'Images' },
    { id: 'archive', label: 'Archives' },
  ];

  return (
    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1c1c1c] flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
      {/* Left: Search & Filter Types */}
      <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-xl">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by file name, sender, or subject..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#202020] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
          />
        </div>

        {/* Filter Pills */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
          {TYPES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectType(id)}
              className={cn(
                'px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer',
                selectedType === id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Files Count & View Switcher */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-500 font-medium">
          {filesCount} {filesCount === 1 ? 'file' : 'files'}
        </span>

        {/* Grid / List Switcher */}
        <div className="flex items-center p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#202020]">
          <button
            type="button"
            onClick={() => onToggleViewMode('grid')}
            title="Grid view"
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#282828] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('list')}
            title="List view"
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-white dark:bg-[#282828] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
            )}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

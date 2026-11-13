'use client';

import React from 'react';
import { HardDrive, Paperclip, Clock, Users, Star, Trash2, FolderPlus, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileCategory } from './useFilesState';

interface FilesSidebarProps {
  activeCategory: FileCategory;
  onSelectCategory: (cat: FileCategory) => void;
  onUpload: () => void;
  onNewFolder: () => void;
}

export function FilesSidebar({
  activeCategory,
  onSelectCategory,
  onUpload,
  onNewFolder,
}: FilesSidebarProps) {
  const CATEGORIES: { id: FileCategory; label: string; icon: React.ElementType; color?: string }[] = [
    { id: 'all', label: 'All Files', icon: HardDrive },
    { id: 'attachments', label: 'Mail Attachments', icon: Paperclip, color: 'text-[#0078d4]' },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'shared', label: 'Shared with Me', icon: Users },
    { id: 'starred', label: 'Starred', icon: Star, color: 'text-amber-500' },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#161616] p-3 flex flex-col justify-between h-full shrink-0 select-none">
      <div>
        {/* Quick Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={onUpload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0078d4] text-white hover:bg-[#106ebe] transition-colors font-semibold text-xs shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={onNewFolder}
            title="Create Folder"
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#202020] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-0.5">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Storage Explorer
          </div>
          {CATEGORIES.map(({ id, label, icon: Icon, color }) => {
            const isActive = activeCategory === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectCategory(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors',
                  isActive
                    ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                )}
              >
                <Icon className={cn('w-4 h-4', color || 'text-neutral-500')} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Storage Breakdown Widget */}
      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">Storage Usage</span>
          <span className="text-[11px] font-bold text-[#0078d4]">32%</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 flex overflow-hidden">
          <div className="bg-[#0078d4] h-full" style={{ width: '12%' }} title="Documents (1.8 GB)" />
          <div className="bg-purple-500 h-full" style={{ width: '10%' }} title="Media (1.4 GB)" />
          <div className="bg-teal-500 h-full" style={{ width: '8%' }} title="Mail Attachments (1.2 GB)" />
          <div className="bg-amber-500 h-full" style={{ width: '2%' }} title="Others (0.4 GB)" />
        </div>

        <div className="text-[11px] text-neutral-500 flex items-center justify-between">
          <span>4.8 GB used</span>
          <span>15 GB Total</span>
        </div>

        {/* Breakdown Key */}
        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800/80 text-[10px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0078d4]" />
            <span>Docs (1.8 GB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Media (1.4 GB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Mail Att (1.2 GB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Other (0.4 GB)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

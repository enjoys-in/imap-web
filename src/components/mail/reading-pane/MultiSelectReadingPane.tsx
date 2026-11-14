'use client';

import React, { useState } from 'react';
import { Trash2, Flag, Mail, FolderInput, X, ChevronDown, Check } from 'lucide-react';
import { useMailStore } from '@/stores';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';

interface MultiSelectReadingPaneProps {
  folderName?: string;
  folderEmailIds: string[];
}

const MOVE_FOLDERS = [
  { id: 'fld-inbox', name: 'Inbox' },
  { id: 'fld-junk', name: 'Junk Email' },
  { id: 'fld-drafts', name: 'Drafts' },
  { id: 'fld-sent', name: 'Sent Items' },
  { id: 'fld-deleted', name: 'Deleted Items' },
  { id: 'fld-archive', name: 'Archive' },
];

export function MultiSelectReadingPane({ folderName = 'Inbox', folderEmailIds }: MultiSelectReadingPaneProps) {
  const selectedIds = useMailStore((s) => s.selectedIds);
  const clearSelectedIds = useMailStore((s) => s.clearSelectedIds);
  const selectAllIds = useMailStore((s) => s.selectAllIds);

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const count = selectedIds.length;

  const handleDelete = () => {
    dispatchMailAction({ action: 'delete' });
  };

  const handleFlag = () => {
    dispatchMailAction({ action: 'toggle-flag' });
  };

  const handleMarkAsUnread = () => {
    dispatchMailAction({ action: 'mark-unread' });
  };

  const handleMove = (folderId: string, name: string) => {
    setIsMoveOpen(false);
    dispatchMailAction({ action: 'move-to', folderId, folderName: name });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 select-none transition-colors">
      {/* Outlook 3D Envelope Illustration */}
      <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute inset-2 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-lg pointer-events-none" />
        
        {/* Stylized Envelope Graphic */}
        <div className="relative w-24 h-20 bg-gradient-to-b from-neutral-700 to-neutral-900 rounded-lg shadow-xl border border-neutral-600/50 flex items-center justify-center overflow-hidden">
          {/* Top flap liner */}
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 opacity-90" />
          {/* Inner card */}
          <div className="w-16 h-12 bg-neutral-800 rounded border border-neutral-600 flex items-center justify-center shadow-inner mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0078d4] to-[#106ebe] shadow-md flex items-center justify-center ring-2 ring-white/30">
              <Check className="w-5 h-5 text-white stroke-[3]" />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Header */}
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
        {count} conversations selected
      </h3>

      <button
        onClick={() => selectAllIds(folderEmailIds)}
        className="text-xs text-[#0078d4] hover:text-[#106ebe] dark:text-blue-400 dark:hover:text-blue-300 hover:underline mb-6 cursor-pointer font-medium"
      >
        Select everything in your {folderName} folder
      </button>

      {/* Vertical Action Buttons */}
      <div className="w-56 space-y-1 relative">
        <button
          onClick={handleDelete}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <span>Delete</span>
        </button>

        <button
          onClick={handleFlag}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Flag className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <span>Flag</span>
        </button>

        <button
          onClick={handleMarkAsUnread}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Mail className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <span>Mark as unread</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMoveOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <FolderInput className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span>Move</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {isMoveOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded shadow-lg py-1 z-30">
              {MOVE_FOLDERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleMove(f.id, f.name)}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={clearSelectedIds}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-t border-neutral-200 dark:border-neutral-800 mt-2"
        >
          <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}

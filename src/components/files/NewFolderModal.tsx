'use client';

import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewFolderModal({ isOpen, onClose, onCreate }: NewFolderModalProps) {
  const [folderName, setFolderName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onCreate(folderName.trim());
    setFolderName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-white dark:bg-[#202020] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#0078d4]/10 text-[#0078d4]">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">New Folder</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Q1 Marketing Assets"
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1a1a1a] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0078d4] text-white hover:bg-[#106ebe] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

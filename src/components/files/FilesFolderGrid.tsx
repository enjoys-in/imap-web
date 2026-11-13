'use client';

import React from 'react';
import { Folder, MoreVertical, Star, Trash2 } from 'lucide-react';
import { StorageFolder } from './useFilesState';

interface FilesFolderGridProps {
  folders: StorageFolder[];
  onSelectFolder?: (folderId: string) => void;
}

export function FilesFolderGrid({ folders, onSelectFolder }: FilesFolderGridProps) {
  if (folders.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
          Folders ({folders.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => onSelectFolder?.(folder.id)}
            className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-[#0078d4] dark:hover:border-[#0078d4] hover:shadow-sm transition-all group cursor-pointer relative"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#0078d4]">
                <Folder className="w-5 h-5 fill-[#0078d4]/20" />
              </div>
              <div className="flex items-center gap-1 text-neutral-400">
                {folder.isFavorite && (
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                )}
                <button
                  type="button"
                  title="Folder Options"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#0078d4] transition-colors">
                {folder.name}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                <span>{folder.fileCount} files</span>
                <span>{folder.updatedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

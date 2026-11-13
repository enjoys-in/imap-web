'use client';

import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  FileCode,
  Star,
  Download,
  Mail,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorageFile } from './useFilesState';

interface FilesItemGridProps {
  files: StorageFile[];
  onPreview: (file: StorageFile) => void;
  onToggleStar: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}

export function FilesItemGrid({
  files,
  onPreview,
  onToggleStar,
  onDelete,
}: FilesItemGridProps) {
  const getFileIcon = (type: StorageFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-rose-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      case 'image':
        return <ImageIcon className="w-8 h-8 text-purple-500" />;
      case 'archive':
        return <Archive className="w-8 h-8 text-amber-500" />;
      case 'doc':
      default:
        return <FileCode className="w-8 h-8 text-[#0078d4]" />;
    }
  };

  if (files.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-400 text-xs">
        <p className="font-semibold text-neutral-600 dark:text-neutral-300">No files found</p>
        <p className="mt-1">Try adjusting your search query or category filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => onPreview(file)}
          className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-[#0078d4] dark:hover:border-[#0078d4] hover:shadow-sm transition-all group cursor-pointer flex flex-col justify-between"
        >
          {/* Top thumbnail & actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
              {getFileIcon(file.type)}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                title={file.isStarred ? 'Unstar file' : 'Star file'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(file.id);
                }}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-amber-500 transition-colors"
              >
                <Star className={cn('w-3.5 h-3.5', file.isStarred && 'text-amber-500 fill-amber-500 opacity-100')} />
              </button>
              <button
                type="button"
                title="Delete file"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(file.id);
                }}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div>
            <h4 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#0078d4] transition-colors">
              {file.name}
            </h4>

            {file.isEmailAttachment && (
              <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 mt-1 truncate">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{file.emailSubject || 'Email attachment'}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <span>{file.size}</span>
              <span>{file.updatedAt}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

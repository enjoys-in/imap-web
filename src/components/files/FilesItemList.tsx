'use client';

import React from 'react';
import { FileText, FileSpreadsheet, Image as ImageIcon, Archive, FileCode, Star, Trash2, Mail, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorageFile } from './useFilesState';

interface FilesItemListProps {
  files: StorageFile[];
  onPreview: (file: StorageFile) => void;
  onToggleStar: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}

export function FilesItemList({
  files,
  onPreview,
  onToggleStar,
  onDelete,
}: FilesItemListProps) {
  const getFileIcon = (type: StorageFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-500" />;
      case 'doc':
      default:
        return <FileCode className="w-4 h-4 text-[#0078d4]" />;
    }
  };

  if (files.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-400 text-xs">
        <p className="font-semibold text-neutral-600 dark:text-neutral-300">No files found</p>
        <p className="mt-1">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-[#202020] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a] text-neutral-500">
              <th className="py-2.5 px-3 w-8" />
              <th className="py-2.5 px-3 font-semibold">Name</th>
              <th className="py-2.5 px-3 font-semibold hidden md:table-cell">Source</th>
              <th className="py-2.5 px-3 font-semibold">Size</th>
              <th className="py-2.5 px-3 font-semibold hidden sm:table-cell">Modified</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {files.map((file) => (
              <tr
                key={file.id}
                onClick={() => onPreview(file)}
                className="hover:bg-neutral-50/70 dark:hover:bg-[#252525] transition-colors cursor-pointer group"
              >
                <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onToggleStar(file.id)}
                    className="text-neutral-300 hover:text-amber-500 transition-colors"
                  >
                    <Star className={cn('w-3.5 h-3.5', file.isStarred && 'text-amber-500 fill-amber-500')} />
                  </button>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2.5 truncate max-w-xs md:max-w-md">
                    {getFileIcon(file.type)}
                    <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#0078d4] transition-colors">
                      {file.name}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-3 hidden md:table-cell text-neutral-500">
                  {file.isEmailAttachment ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[140px]">{file.emailSubject || 'Email'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400">Cloud Storage</span>
                  )}
                </td>
                <td className="py-2 px-3 text-neutral-500 whitespace-nowrap">{file.size}</td>
                <td className="py-2 px-3 hidden sm:table-cell text-neutral-500 whitespace-nowrap">{file.updatedAt}</td>
                <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Download"
                      onClick={() => onPreview(file)}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => onDelete(file.id)}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

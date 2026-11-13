'use client';

import React from 'react';
import { X, Download, Share2, Star, Trash2, Mail, HardDrive, FileText } from 'lucide-react';
import { StorageFile } from './useFilesState';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

interface FilePreviewModalProps {
  file: StorageFile | null;
  onClose: () => void;
  onToggleStar: (fileId: string) => void;
  onDelete: (fileId: string) => void;
}

export function FilePreviewModal({
  file,
  onClose,
  onToggleStar,
  onDelete,
}: FilePreviewModalProps) {
  const addToast = useToastStore((s) => s.addToast);

  if (!file) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    addToast({ title: 'Link Copied', description: 'Shareable link copied to clipboard.', type: 'info' });
  };

  const handleDownload = () => {
    addToast({ title: 'Downloading File', description: `Starting download for ${file.name}`, type: 'success' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white dark:bg-[#202020] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-[#0078d4] shrink-0" />
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">{file.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Sandbox */}
        <div className="p-6 bg-neutral-50 dark:bg-[#181818] flex flex-col items-center justify-center border-b border-neutral-200 dark:border-neutral-800 text-center min-h-[160px]">
          <div className="w-16 h-16 rounded-2xl bg-[#0078d4]/10 text-[#0078d4] flex items-center justify-center mb-3 shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 max-w-sm truncate">{file.name}</h4>
          <p className="text-xs text-neutral-400 mt-0.5">{file.size} • {file.type.toUpperCase()}</p>
        </div>

        {/* Metadata Details */}
        <div className="p-5 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 py-1">
            <div>
              <span className="text-neutral-400 block text-[11px]">Last Modified</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{file.updatedAt}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Storage Source</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1 mt-0.5">
                {file.isEmailAttachment ? (
                  <>
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>Email Attachment</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cloud Storage</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {file.emailSubject && (
            <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Attached In Message</span>
              <p className="font-medium text-neutral-900 dark:text-neutral-100 text-xs mt-0.5 truncate">{file.emailSubject}</p>
              {file.sender && <p className="text-[11px] text-neutral-500 truncate">From: {file.sender}</p>}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-100/60 dark:bg-[#1c1c1c] border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleStar(file.id)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-600 dark:text-neutral-300 hover:text-amber-500 transition-colors cursor-pointer"
              title="Favorite"
            >
              <Star className={cn('w-4 h-4', file.isStarred && 'text-amber-500 fill-amber-500')} />
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-600 dark:text-neutral-300 hover:text-[#0078d4] transition-colors cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(file.id);
                onClose();
              }}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-600 dark:text-neutral-300 hover:text-rose-500 transition-colors cursor-pointer"
              title="Delete File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#0078d4] text-white hover:bg-[#106ebe] transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}

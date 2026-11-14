'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip, ChevronDown, FileText, FileSpreadsheet, Image as ImageIcon,
  FolderOpen, Clock, File
} from 'lucide-react';
import { useComposeStore } from '@/stores';
import { useRecentAttachmentsStore, RecentAttachment } from '@/stores/useRecentAttachmentsStore';
import { useToastStore } from '@/stores/useToastStore';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ComposeAttachMenuProps {
  variant?: 'button' | 'icon';
  className?: string;
}

export function ComposeAttachMenu({ variant = 'button', className }: ComposeAttachMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const addAttachment = useComposeStore((s) => s.addAttachment);
  const recentAttachments = useRecentAttachmentsStore((s) => s.recentAttachments);
  const addRecent = useRecentAttachmentsStore((s) => s.addRecent);
  const createSyntheticFile = useRecentAttachmentsStore((s) => s.createSyntheticFile);
  const addToast = useToastStore((s) => s.addToast);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleRecentClick = (rec: RecentAttachment) => {
    const file = createSyntheticFile(rec);
    addAttachment(file);
    addRecent(rec);
    setIsOpen(false);
    addToast({
      title: 'Attachment Added',
      description: `Attached ${rec.name} (${formatFileSize(rec.size)})`,
      type: 'success',
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    useComposeStore.getState().updateFields({ isAttaching: false });
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        addAttachment(file);
        addRecent({ name: file.name, size: file.size, type: file.type });
        addToast({
          title: 'Attachment Added',
          description: `Attached ${file.name} (${formatFileSize(file.size)})`,
          type: 'success',
        });
      });
      e.target.value = '';
    }
    setIsOpen(false);
  };

  const handleOpenBrowse = () => {
    setIsOpen(false);
    useComposeStore.getState().updateFields({ isAttaching: true });
    fileInputRef.current?.click();
    setTimeout(() => {
      useComposeStore.getState().updateFields({ isAttaching: false });
    }, 1500);
  };

  const getFileIcon = (name: string, type: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || type.includes('pdf')) return <FileText className="w-3.5 h-3.5 text-red-500" />;
    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || '') || type.includes('image'))
      return <ImageIcon className="w-3.5 h-3.5 text-blue-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '') || type.includes('sheet'))
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />;
    return <File className="w-3.5 h-3.5 text-neutral-400" />;
  };

  return (
    <div ref={containerRef} className="relative inline-block select-none text-xs">
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInputChange} />

      {variant === 'button' ? (
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            'h-7 px-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded flex items-center gap-1.5 transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer',
            className
          )}
          title="Attach files (shows recent 3 attachments)"
        >
          <Paperclip className="w-3.5 h-3.5" />
          <span>Attach</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            'p-1 hover:bg-neutral-200 dark:hover:bg-[#383838] rounded text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-0.5 shrink-0 cursor-pointer',
            className
          )}
          title="Attach file (shows last 3 used attachments)"
        >
          <Paperclip className="w-3.5 h-3.5" />
          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
        </button>
      )}

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700/80 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>Recent attachments (Last 3 used)</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentAttachments.map((rec) => (
              <button
                key={rec.id}
                type="button"
                onClick={() => handleRecentClick(rec)}
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer transition-colors group"
              >
                {getFileIcon(rec.name, rec.type)}
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-[#0078d4]">
                    {rec.name}
                  </div>
                  <div className="text-[10px] text-neutral-400">{formatFileSize(rec.size)}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 my-1 pt-1">
            <button
              type="button"
              onClick={handleOpenBrowse}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Browse this computer...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

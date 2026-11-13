'use client';

import React from 'react';
import { FileText, Download, FileSpreadsheet, File } from 'lucide-react';
import { MailAttachment } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface ReadingPaneAttachmentsProps {
  attachments?: MailAttachment[];
}

function getFileIcon(contentType: string, fileName: string) {
  if (contentType.includes('pdf') || fileName.endsWith('.pdf')) {
    return <FileText className="w-5 h-5 text-red-500 shrink-0" />;
  }
  if (
    contentType.includes('spreadsheet') ||
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.csv')
  ) {
    return <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />;
  }
  return <File className="w-5 h-5 text-neutral-500 shrink-0" />;
}

export function ReadingPaneAttachments({ attachments }: ReadingPaneAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 select-none">
      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
        Attachments ({attachments.length})
      </div>

      <div className="flex flex-wrap gap-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-xs text-xs hover:border-[#0078d4] transition-colors group cursor-pointer"
          >
            {getFileIcon(att.contentType, att.fileName)}

            <div className="truncate max-w-[180px]">
              <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                {att.fileName}
              </p>
              <p className="text-[11px] text-neutral-400">{formatFileSize(att.size)}</p>
            </div>

            <button
              className="p-1 text-neutral-400 group-hover:text-[#0078d4] hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors ml-1"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

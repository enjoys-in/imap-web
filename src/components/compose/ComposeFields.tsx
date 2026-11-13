'use client';

import React, { useState } from 'react';
import { X, Paperclip } from 'lucide-react';
import { useComposeStore } from '@/stores';
import { formatFileSize } from '@/lib/utils';

export function ComposeFields() {
  const to = useComposeStore((s) => s.to);
  const cc = useComposeStore((s) => s.cc);
  const bcc = useComposeStore((s) => s.bcc);
  const subject = useComposeStore((s) => s.subject);
  const attachments = useComposeStore((s) => s.attachments);
  const updateFields = useComposeStore((s) => s.updateFields);
  const removeAttachment = useComposeStore((s) => s.removeAttachment);

  const [showCc, setShowCc] = useState(Boolean(cc));
  const [showBcc, setShowBcc] = useState(Boolean(bcc));

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1 space-y-1 text-xs">
      <div className="flex items-center gap-2 py-1">
        <span className="w-10 text-neutral-500 font-medium shrink-0">To</span>
        <input
          type="text"
          value={to}
          onChange={(e) => updateFields({ to: e.target.value })}
          placeholder="Recipients"
          className="flex-1 bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100"
        />
        <div className="flex items-center gap-2 text-neutral-400">
          {!showCc && (
            <button
              onClick={() => setShowCc(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-200 font-medium"
            >
              Cc
            </button>
          )}
          {!showBcc && (
            <button
              onClick={() => setShowBcc(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-200 font-medium"
            >
              Bcc
            </button>
          )}
        </div>
      </div>

      {showCc && (
        <div className="flex items-center gap-2 py-1 border-t border-neutral-100 dark:border-neutral-800">
          <span className="w-10 text-neutral-500 font-medium shrink-0">Cc</span>
          <input
            type="text"
            value={cc}
            onChange={(e) => updateFields({ cc: e.target.value })}
            placeholder="Carbon copy recipients"
            className="flex-1 bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100"
          />
        </div>
      )}

      {showBcc && (
        <div className="flex items-center gap-2 py-1 border-t border-neutral-100 dark:border-neutral-800">
          <span className="w-10 text-neutral-500 font-medium shrink-0">Bcc</span>
          <input
            type="text"
            value={bcc}
            onChange={(e) => updateFields({ bcc: e.target.value })}
            placeholder="Blind carbon copy recipients"
            className="flex-1 bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100"
          />
        </div>
      )}

      <div className="flex items-center gap-2 py-1 border-t border-neutral-100 dark:border-neutral-800">
        <input
          type="text"
          value={subject}
          onChange={(e) => updateFields({ subject: e.target.value })}
          placeholder="Add a subject"
          className="w-full bg-transparent font-medium focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
        />
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 py-1.5 border-t border-neutral-100 dark:border-neutral-800">
          {attachments.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-1.5 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-[11px]"
            >
              <Paperclip className="w-3 h-3 text-neutral-400" />
              <span className="truncate max-w-[140px] font-medium text-neutral-700 dark:text-neutral-300">
                {file.name}
              </span>
              <span className="text-neutral-400">({formatFileSize(file.size)})</span>
              <button
                onClick={() => removeAttachment(idx)}
                className="hover:text-red-500 text-neutral-400 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

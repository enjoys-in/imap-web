'use client';

import React, { useState } from 'react';
import { X, Paperclip } from 'lucide-react';
import { useComposeStore } from '@/stores';
import { formatFileSize } from '@/lib/utils';
import { RecipientChipInput } from './RecipientChipInput';

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

  const handleToggleBcc = () => setShowBcc(true);

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1 space-y-1 text-xs">
      {/* To Field with Recipient Chips */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <RecipientChipInput
            label="To"
            value={to}
            onChange={(val) => updateFields({ to: val })}
            placeholder="Recipients"
            autoFocus={!to}
          />
        </div>
        <div className="flex items-center gap-2 text-neutral-400 shrink-0">
          {!showCc && (
            <button
              type="button"
              onClick={() => setShowCc(true)}
              className="hover:text-neutral-700 dark:hover:text-neutral-200 font-medium cursor-pointer"
            >
              Cc
            </button>
          )}
          {!showBcc && (
            <button
              type="button"
              onClick={handleToggleBcc}
              className="hover:text-neutral-700 dark:hover:text-neutral-200 font-medium cursor-pointer"
            >
              Bcc
            </button>
          )}
        </div>
      </div>

      {/* Cc Field with Recipient Chips */}
      {showCc && (
        <div className="border-t border-neutral-100 dark:border-neutral-800">
          <RecipientChipInput
            label="Cc"
            value={cc}
            onChange={(val) => updateFields({ cc: val })}
            placeholder="Carbon copy recipients"
          />
        </div>
      )}

      {/* Bcc Field with Recipient Chips */}
      {showBcc && (
        <div className="border-t border-neutral-100 dark:border-neutral-800">
          <RecipientChipInput
            label="Bcc"
            value={bcc}
            onChange={(val) => updateFields({ bcc: val })}
            placeholder="Blind carbon copy recipients"
          />
        </div>
      )}

      {/* Subject Line */}
      <div className="flex items-center gap-2 py-1 border-t border-neutral-100 dark:border-neutral-800">
        <input
          type="text"
          value={subject}
          onChange={(e) => updateFields({ subject: e.target.value })}
          placeholder="Add a subject"
          className="w-full bg-transparent font-medium focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
        />
      </div>

      {/* Attachments List */}
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
                type="button"
                onClick={() => removeAttachment(idx)}
                className="hover:text-red-500 text-neutral-400 ml-0.5 cursor-pointer"
                title="Remove attachment"
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

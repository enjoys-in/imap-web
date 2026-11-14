'use client';

import React from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useComposeStore, useMailStore } from '@/stores';
import { emailsApi } from '@/lib/api';
import { ComposeAttachMenu } from './ComposeAttachMenu';
import { ComposeSignatureMenu } from './ComposeSignatureMenu';

interface ComposeToolbarProps {
  onSend: () => void;
}

export function ComposeToolbar({ onSend }: ComposeToolbarProps) {
  const close = useComposeStore((s) => s.close);
  const draftId = useComposeStore((s) => s.draftId);
  const deleteEmail = useMailStore((s) => s.deleteEmail);

  const handleDiscard = () => {
    if (draftId) {
      deleteEmail(draftId);
      emailsApi.deleteEmail(draftId, 'fld-drafts').catch(() => {});
    }
    close();
  };

  return (
    <div className="h-10 border-b border-neutral-200 dark:border-neutral-700 px-3 flex items-center justify-between bg-white dark:bg-neutral-900 select-none">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSend}
          className="h-7 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>

        <ComposeAttachMenu variant="button" />
        <ComposeSignatureMenu />
      </div>

      <button
        type="button"
        onClick={handleDiscard}
        className="p-1 hover:text-red-600 text-neutral-500 rounded transition-colors cursor-pointer"
        title="Discard draft"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

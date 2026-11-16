'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { useComposeStore, useMailStore } from '@/stores';
import { findRegisteredSpecialFolder } from '@/lib/folders';
import { ComposeAttachMenu } from './ComposeAttachMenu';
import { ComposeSignatureMenu } from './ComposeSignatureMenu';
import { ComposeScheduleSendMenu } from './ComposeScheduleSendMenu';
import { ComposeSuggestTimesMenu } from './ComposeSuggestTimesMenu';
import { ComposeTemplatesMenu } from './ComposeTemplatesMenu';
import { ComposeVoiceDictationButton } from './ComposeVoiceDictationButton';

interface ComposeToolbarProps {
  onSend: () => void;
  onScheduleSend?: (scheduledTime: Date) => void;
  onSendAndArchive?: () => void;
}

export function ComposeToolbar({ onSend, onScheduleSend, onSendAndArchive }: ComposeToolbarProps) {
  const close = useComposeStore((s) => s.close);
  const draftId = useComposeStore((s) => s.draftId);
  const deleteEmail = useMailStore((s) => s.deleteEmail);

  const handleDiscard = () => {
    if (draftId) {
      const accountId = useMailStore.getState().selectedAccountId;
      deleteEmail(draftId, findRegisteredSpecialFolder('Drafts', accountId)?.id);
    }
    close();
  };

  return (
    <div className="h-10 border-b border-neutral-200 dark:border-neutral-700 px-3 flex items-center justify-between bg-white dark:bg-neutral-900 select-none">
      <div className="flex items-center gap-2">
        <ComposeScheduleSendMenu
          onSend={onSend}
          onScheduleSend={onScheduleSend || (() => onSend())}
          onSendAndArchive={onSendAndArchive}
        />

        <ComposeAttachMenu variant="button" />
        <ComposeSignatureMenu />
        <ComposeSuggestTimesMenu />
        <ComposeTemplatesMenu />
        <ComposeVoiceDictationButton />
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

'use client';

import React from 'react';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { MailMessage, MailMessageMetadata } from '@/types';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { buildMailContextMenuItems, MailContextActions } from './mailContextMenuItems';

interface MailItemContextMenuProps {
  email: MailMessageMetadata | MailMessage | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export function MailItemContextMenu({
  email,
  position,
  onClose,
}: MailItemContextMenuProps) {
  if (!email || !position) return null;

  const actions: MailContextActions = {
    onReply: (em, replyAll) =>
      dispatchMailAction({
        action: replyAll ? 'reply-all' : 'reply',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onForward: (em) =>
      dispatchMailAction({
        action: 'forward',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onDelete: (id) =>
      dispatchMailAction({
        action: 'delete',
        targetEmailId: id,
        targetEmail: email,
      }),
    onArchive: (id) =>
      dispatchMailAction({
        action: 'archive',
        targetEmailId: id,
        targetEmail: email,
      }),
    onMoveTo: (id, folderId, folderName) =>
      dispatchMailAction({
        action: 'move-to',
        targetEmailId: id,
        targetEmail: email,
        folderId,
        folderName,
      }),
    onCopyTo: (id, folderId, folderName) =>
      dispatchMailAction({
        action: 'copy-to',
        targetEmailId: id,
        targetEmail: email,
        folderId,
        folderName,
      }),
    onCategorize: (id, category) =>
      dispatchMailAction({
        action: 'categorize',
        targetEmailId: id,
        targetEmail: email,
        category,
      }),
    onToggleRead: (id) =>
      dispatchMailAction({
        action: 'toggle-read',
        targetEmailId: id,
        targetEmail: email,
      }),
    onTogglePin: (id) =>
      dispatchMailAction({
        action: 'toggle-pin',
        targetEmailId: id,
        targetEmail: email,
      }),
    onToggleFlag: (id) =>
      dispatchMailAction({
        action: 'toggle-flag',
        targetEmailId: id,
        targetEmail: email,
      }),
    onSetFlagDue: (id, label) =>
      dispatchMailAction({
        action: 'set-flag-due',
        targetEmailId: id,
        targetEmail: email,
        dueDateLabel: label,
      }),
    onSnooze: (id, label) =>
      dispatchMailAction({
        action: 'snooze',
        targetEmailId: id,
        targetEmail: email,
        snoozeUntil: label,
      }),
    onBlock: (address) =>
      dispatchMailAction({
        action: 'block-sender',
        targetEmailId: email.id,
        targetEmail: email,
        senderAddress: address,
      }),
    onAllowSender: (address) =>
      dispatchMailAction({
        action: 'allow-sender',
        targetEmailId: email.id,
        targetEmail: email,
        senderAddress: address,
      }),
    onMute: (id) =>
      dispatchMailAction({
        action: 'mute-conversation',
        targetEmailId: id,
        targetEmail: email,
      }),
    onReportJunk: (em) =>
      dispatchMailAction({
        action: 'report-junk',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onReportPhishing: (em) =>
      dispatchMailAction({
        action: 'report-phishing',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onReportConcern: (em) =>
      dispatchMailAction({
        action: 'report-concern',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onFindConversation: (em) =>
      dispatchMailAction({
        action: 'find-conversation',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onFindFromSender: (em) =>
      dispatchMailAction({
        action: 'find-from-sender',
        targetEmailId: em.id,
        targetEmail: em,
        senderAddress: em.fromAddress,
      }),
    onCreateTask: (em) =>
      dispatchMailAction({
        action: 'create-task',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onAddContact: (em) =>
      dispatchMailAction({
        action: 'add-contact',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onViewSource: (em) =>
      dispatchMailAction({
        action: 'view-source',
        targetEmailId: em.id,
        targetEmail: em,
      }),
    onToast: (title, desc, type = 'info') => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('airsend:toast', {
            detail: { title, description: desc, type },
          })
        );
      }
    },
  };

  const items = buildMailContextMenuItems(email, actions);

  return <ContextMenu x={position.x} y={position.y} items={items} onClose={onClose} />;
}

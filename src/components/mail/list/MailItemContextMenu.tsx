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
    onSnooze: (id, label) =>
      dispatchMailAction({
        action: 'snooze',
        targetEmailId: id,
        targetEmail: email,
        snoozeUntil: label,
      }),
    onBlock: (address) => {
      dispatchMailAction({
        action: 'report-junk',
        targetEmailId: email.id,
        targetEmail: email,
      });
    },
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

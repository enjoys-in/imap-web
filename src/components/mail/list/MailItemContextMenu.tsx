'use client';

import React from 'react';
import { ContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu';
import { MailMessage, MailMessageMetadata } from '@/types';
import {
  CornerUpLeft,
  ReplyAll,
  CornerUpRight,
  Mail,
  MailOpen,
  Pin,
  Flag,
  Archive,
  Trash2,
  FolderInput,
} from 'lucide-react';
import { useComposeStore, useMailStore } from '@/stores';
import { useToastStore } from '@/stores/useToastStore';

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
  const openReply = useComposeStore((s) => s.openReply);
  const openForward = useComposeStore((s) => s.openForward);

  const togglePin = useMailStore((s) => s.togglePin);
  const toggleFlag = useMailStore((s) => s.toggleFlag);
  const markAsRead = useMailStore((s) => s.markAsRead);
  const deleteEmail = useMailStore((s) => s.deleteEmail);
  const moveEmailToFolder = useMailStore((s) => s.moveEmailToFolder);
  const addToast = useToastStore((s) => s.addToast);

  if (!email || !position) return null;

  const items: ContextMenuItem[] = [
    {
      label: 'Reply',
      icon: CornerUpLeft,
      onClick: () => openReply(email, false),
    },
    {
      label: 'Reply All',
      icon: ReplyAll,
      onClick: () => openReply(email, true),
    },
    {
      label: 'Forward',
      icon: CornerUpRight,
      onClick: () => openForward(email),
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: email.isRead ? 'Mark as unread' : 'Mark as read',
      icon: email.isRead ? Mail : MailOpen,
      onClick: () => markAsRead(email.id),
    },
    {
      label: email.isPinned ? 'Unpin' : 'Pin to top',
      icon: Pin,
      onClick: () => {
        togglePin(email.id);
        addToast({
          title: email.isPinned ? 'Unpinned' : 'Pinned to Top',
          description: email.subject,
          type: 'info',
        });
      },
    },
    {
      label: email.isFlagged ? 'Clear flag' : 'Flag message',
      icon: Flag,
      onClick: () => toggleFlag(email.id),
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: 'Move to Archive',
      icon: Archive,
      onClick: () => {
        moveEmailToFolder(email.id, 'fld-archive');
        addToast({ title: 'Archived', description: 'Message moved to Archive.', type: 'success' });
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      destructive: true,
      onClick: () => deleteEmail(email.id),
    },
  ];

  return <ContextMenu x={position.x} y={position.y} items={items} onClose={onClose} />;
}

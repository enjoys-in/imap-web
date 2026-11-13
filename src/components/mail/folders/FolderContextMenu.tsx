'use client';

import React from 'react';
import { ContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu';
import { MailFolder } from '@/types';
import { folderIdToSlug } from '@/lib/folderSlugUtils';
import {
  ExternalLink,
  MailCheck,
  FolderPlus,
  Star,
  Trash2,
  FolderInput,
} from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { useMailStore } from '@/stores/useMailStore';

interface FolderContextMenuProps {
  folder: MailFolder | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (folderId: string) => void;
}

export function FolderContextMenu({
  folder,
  position,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: FolderContextMenuProps) {
  const addToast = useToastStore((s) => s.addToast);
  const markFolderAsRead = useMailStore((s) => s.markFolderAsRead);
  const emptyFolder = useMailStore((s) => s.emptyFolder);

  if (!folder || !position) return null;

  const items: ContextMenuItem[] = [
    {
      label: 'Open in new window',
      icon: ExternalLink,
      onClick: () => {
        const slug = folderIdToSlug(folder.id);
        window.open(`/mail/u/0/#${slug}`, '_blank');
      },
    },
    {
      label: 'Mark all as read',
      icon: MailCheck,
      onClick: () => {
        markFolderAsRead(folder.id);
        addToast({
          title: 'Marked as Read',
          description: `All items in ${folder.displayName} marked as read.`,
          type: 'success',
        });
      },
    },
    {
      label: 'New subfolder',
      icon: FolderPlus,
      onClick: () => {
        addToast({
          title: 'New Folder',
          description: `Creating subfolder in ${folder.displayName}...`,
          type: 'info',
        });
      },
    },
    {
      label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon: Star,
      onClick: () => {
        if (onToggleFavorite) onToggleFavorite(folder.id);
        addToast({
          title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
          description: folder.displayName,
          type: 'info',
        });
      },
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: folder.special === 'Trash' ? 'Empty Deleted Items' : 'Move folder',
      icon: folder.special === 'Trash' ? Trash2 : FolderInput,
      destructive: folder.special === 'Trash',
      onClick: () => {
        if (folder.special === 'Trash') {
          emptyFolder(folder.id);
        }
        addToast({
          title: folder.special === 'Trash' ? 'Folder Emptied' : 'Folder Moved',
          description: folder.displayName,
          type: 'info',
        });
      },
    },
  ];

  return <ContextMenu x={position.x} y={position.y} items={items} onClose={onClose} />;
}

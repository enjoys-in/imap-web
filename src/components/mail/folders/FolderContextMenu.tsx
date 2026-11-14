'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  Edit2,
  FolderX,
} from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { useMailStore } from '@/stores/useMailStore';
import { useAlertStore } from '@/stores/useAlertStore';
import { foldersApi } from '@/lib/api';

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
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const markFolderAsRead = useMailStore((s) => s.markFolderAsRead);
  const emptyFolder = useMailStore((s) => s.emptyFolder);

  if (!folder || !position) return null;

  const isCustomFolder = folder.special === 'None';
  const isTrashOrJunk = folder.special === 'Trash' || folder.special === 'Junk';

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
      onClick: async () => {
        const subName = await useAlertStore.getState().showPrompt({
          title: 'New Subfolder',
          description: `Enter a name for the subfolder inside "${folder.displayName}":`,
          label: 'Subfolder name',
          placeholder: 'e.g. Archives, 2026',
          confirmText: 'Create subfolder',
        });
        if (!subName?.trim()) return;
        try {
          const res = await foldersApi.createFolder(folder.accountId || 'acc-1', subName.trim(), folder.fullName || folder.displayName);
          queryClient.invalidateQueries({ queryKey: ['folders'] });
          addToast({ title: 'Subfolder Created', description: (res as any)?.message || `Created "${subName.trim()}" inside ${folder.displayName}.`, type: 'success' });
        } catch (err: any) {
          addToast({ title: 'Failed to create subfolder', description: err?.message || 'Could not create subfolder on the server.', type: 'error' });
        }
      },
    },
    {
      label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon: Star,
      onClick: () => {
        if (onToggleFavorite) onToggleFavorite(folder.id);
        addToast({ title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites', description: folder.displayName, type: 'info' });
      },
    },
    { divider: true, label: '', onClick: () => {} },
  ];

  if (isCustomFolder) {
    items.push({
      label: 'Rename folder',
      icon: Edit2,
      onClick: async () => {
        const newName = await useAlertStore.getState().showPrompt({
          title: 'Rename Folder',
          description: `Rename folder "${folder.displayName}" to:`,
          defaultValue: folder.displayName,
          label: 'New name',
          placeholder: 'Enter new folder name...',
          confirmText: 'Rename',
        });
        if (!newName?.trim() || newName.trim() === folder.displayName) return;
        try {
          const res = await foldersApi.renameFolder(folder.id, newName.trim(), folder.fullName || folder.displayName);
          queryClient.invalidateQueries({ queryKey: ['folders'] });
          addToast({ title: 'Folder Renamed', description: (res as any)?.message || `Renamed to ${newName.trim()}.`, type: 'success' });
        } catch (err: any) {
          addToast({ title: 'Rename Failed', description: err?.message || 'Could not rename folder on the server.', type: 'error' });
        }
      },
    });

    items.push({
      label: 'Delete folder',
      icon: FolderX,
      destructive: true,
      onClick: async () => {
        const confirm = await useAlertStore.getState().showConfirm({
          title: 'Delete Folder',
          description: `Are you sure you want to delete folder "${folder.displayName}"? All items inside will be moved to Deleted items.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          type: 'warning',
        });
        if (!confirm) return;
        try {
          const res = await foldersApi.deleteFolder(folder.id, folder.fullName || folder.displayName);
          queryClient.invalidateQueries({ queryKey: ['folders'] });
          addToast({ title: 'Folder Deleted', description: (res as any)?.message || `Removed folder ${folder.displayName}.`, type: 'success' });
        } catch (err: any) {
          addToast({ title: 'Delete Failed', description: err?.message || 'Could not delete folder from the server.', type: 'error' });
        }
      },
    });
  }

  if (isTrashOrJunk) {
    items.push({
      label: folder.special === 'Trash' ? 'Empty Deleted Items' : 'Empty Junk Email',
      icon: Trash2,
      destructive: true,
      onClick: () => {
        emptyFolder(folder.id);
        addToast({ title: 'Folder Emptied', description: `Emptied all items in ${folder.displayName}.`, type: 'info' });
      },
    });
  }

  return (
    <ContextMenu
      items={items}
      x={position.x}
      y={position.y}
      onClose={onClose}
    />
  );
}

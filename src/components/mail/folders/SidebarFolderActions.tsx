'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, FolderPlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/lib/api';
import { useToastStore } from '@/stores/useToastStore';
import { PromptDialog } from '@/components/ui/PromptDialog';

interface SidebarFolderActionsProps {
  activeAccId: string;
}

export function SidebarFolderActions({ activeAccId }: SidebarFolderActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const handleConfirm = async (name: string) => {
    try {
      await foldersApi.createFolder(activeAccId, name.trim());
      queryClient.invalidateQueries({ queryKey: ['folders', activeAccId] });
      addToast({ title: 'Folder Created', description: `Created folder "${name.trim()}".`, type: 'success' });
      setIsOpen(false);
    } catch {
      addToast({ title: 'Failed to create folder', description: 'Could not create folder on the server.', type: 'error' });
    }
  };

  return (
    <>
      <div className="pt-2 space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
        >
          <FolderPlus className="w-4 h-4 text-blue-500" />
          <span>New folder</span>
        </button>
        <Link
          href="/settings/accounts"
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add account</span>
        </Link>
      </div>

      <PromptDialog
        open={isOpen}
        title="New Folder"
        description="Create a custom folder to organize your messages."
        label="Folder name"
        placeholder="e.g. Invoices, Projects, Personal"
        confirmText="Create folder"
        onConfirm={handleConfirm}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

'use client';

import React from 'react';
import { PromptDialog } from '@/components/ui/PromptDialog';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function NewFolderModal({ isOpen, onClose, onCreate }: NewFolderModalProps) {
  return (
    <PromptDialog
      open={isOpen}
      title="New Folder"
      description="Create a new folder to organize your files and attachments."
      label="Folder Name"
      placeholder="e.g. Q1 Marketing Assets"
      confirmText="Create Folder"
      onConfirm={(name) => {
        onCreate(name);
        onClose();
      }}
      onClose={onClose}
    />
  );
}

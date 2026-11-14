import { useMailStore, useToastStore } from '@/stores';
import { findRegisteredSpecialFolder } from '@/lib/folders';
import type { MailFolder, SpecialFolder } from '@/types';

export function getSpecialFolder(special: SpecialFolder): MailFolder | undefined {
  return findRegisteredSpecialFolder(special, useMailStore.getState().selectedAccountId);
}

export function requireSpecialFolder(special: SpecialFolder, label: string): MailFolder | undefined {
  const folder = getSpecialFolder(special);
  if (!folder) {
    useToastStore.getState().addToast({
      title: `No ${label} folder`,
      description: `This mailbox does not have a ${label.toLowerCase()} folder.`,
      type: 'warning',
    });
  }
  return folder;
}

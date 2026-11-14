import { useMailStore, useToastStore } from '@/stores';
import { findRegisteredSpecialFolder } from '@/lib/folders';
import type { MailFolder, SpecialFolder } from '@/types';

/**
 * The current account's folder with this classification, taken from the folder
 * list the backend sent (never from a hardcoded id).
 */
export function getSpecialFolder(special: SpecialFolder): MailFolder | undefined {
  return findRegisteredSpecialFolder(special, useMailStore.getState().selectedAccountId);
}

/** Like `getSpecialFolder`, but tells the user when the account has no such folder. */
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

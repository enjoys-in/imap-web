import type {
  FolderTotalsPayload,
  MailboxChangeEventPayload,
  MailboxExpungeEventPayload,
  MessageFlagsEventPayload,
} from '@/lib/api/handlers/stream';
import type { MailFolder } from '@/types';
import { findRegisteredFolderByPath } from '@/lib/folders';
import { invalidateFolderSync } from '@/lib/idb/mailCacheDb';
import { invalidateQuota, setInboxQuota } from '@/lib/queryClientRef';
import { useFolderStore } from '@/stores/useFolderStore';
import { useMailStore } from '@/stores/useMailStore';

type FolderEvent = FolderTotalsPayload & { path: string };
type KnownTotals = FolderEvent & { totalCount: number; unreadCount: number };

const hasTotals = (event: FolderEvent): event is KnownTotals =>
  typeof event.totalCount === 'number' && typeof event.unreadCount === 'number';

async function applyTotals(
  event: FolderEvent,
  options: { immediate?: boolean; resync?: boolean } = {}
): Promise<void> {
  const { selectedAccountId, selectedFolderId } = useMailStore.getState();
  const folders = useFolderStore.getState();

  if (options.resync) {
    await folders.syncFolders(selectedAccountId, selectedFolderId);
  } else if (hasTotals(event)) {
    await folders.applyServerCounts(
      [{ path: event.path, totalCount: event.totalCount, unreadCount: event.unreadCount }],
      selectedFolderId
    );
  } else if (options.immediate) {
    await folders.syncFolders(selectedAccountId, selectedFolderId);
  } else {
    folders.syncFoldersSoon(selectedAccountId, selectedFolderId);
  }

  if (event.quota?.storage) setInboxQuota(event.quota);
  else invalidateQuota();
}

const addedCount = (event: MailboxChangeEventPayload): number =>
  event.newCount ?? Math.max(0, event.count - event.prevCount);

export function newMessageCount(event: MailboxChangeEventPayload): number {
  return event.reason ? 0 : addedCount(event);
}

export function folderListChanged(event: MailboxChangeEventPayload, known: MailFolder | undefined): boolean {
  if (!known) return true;
  return event.newCount === 0 && event.totalCount === 0 && event.unreadCount === 0;
}

export function shouldNotifyNewMail(event: MailboxChangeEventPayload): boolean {
  if (newMessageCount(event) === 0) return false;
  const { selectedAccountId } = useMailStore.getState();
  return findRegisteredFolderByPath(event.path, selectedAccountId)?.special === 'Inbox';
}

export async function handleMailboxChange(event: MailboxChangeEventPayload): Promise<void> {
  const { selectedAccountId, selectedFolderId } = useMailStore.getState();
  const changed = findRegisteredFolderByPath(event.path, selectedAccountId);

  await applyTotals(event, { immediate: true, resync: folderListChanged(event, changed) });

  if (!changed) return;
  if (changed.id === selectedFolderId) {
    await useMailStore.getState().refreshFolder(changed.id);
  } else if (addedCount(event) > 0) {
    await invalidateFolderSync(changed.id);
  }
}

export function handleMailboxExpunge(event: MailboxExpungeEventPayload): void {
  const { selectedAccountId, selectedFolderId } = useMailStore.getState();
  const folder = findRegisteredFolderByPath(event.path, selectedAccountId);

  if (folder && event.uid) {
    useMailStore.getState().removeEmailFromFolder(folder.id, `msg-${event.uid}`);
  } else if (folder && event.removedCount) {
    if (folder.id === selectedFolderId) {
      void useMailStore.getState().fetchEmails(folder.id, selectedAccountId, { force: true });
    } else {
      void invalidateFolderSync(folder.id);
    }
  }

  void applyTotals(event);
}

export function handleMessageFlags(event: MessageFlagsEventPayload): void {
  if (!event.uid || !event.flags) return;

  void applyTotals(event);

  const { selectedAccountId, localEmails } = useMailStore.getState();
  const folder = findRegisteredFolderByPath(event.path, selectedAccountId);
  if (!folder) return;

  const id = `msg-${event.uid}`;
  const isRead = event.flags.includes('\\Seen');
  const isFlagged = event.flags.includes('\\Flagged');

  const known = localEmails.find((m) => m.folderId === folder.id && m.id === id);
  if (known && known.isRead === isRead && known.isFlagged === isFlagged) return;

  useMailStore.getState().applyMessageFlags(folder.id, id, { isRead, isFlagged });
}

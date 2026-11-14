'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/providers/SessionProvider';
import { useEmailStream } from '@/hooks/useEmailStream';
import { useSyncScheduler } from '@/hooks/useSyncManager';
import { useMailStore } from '@/stores/useMailStore';
import { useFolderStore } from '@/stores/useFolderStore';
import { findRegisteredFolderByPath } from '@/lib/folders';
import { useToastStore } from '@/stores/useToastStore';

/**
 * Global background sync bridge: listens to the backend's Server-Sent Events
 * (IMAP IDLE) and turns each event into the minimum set of requests.
 *
 * Mail is fetched once and then read from the local copy (IndexedDB); these
 * events are what tell us something changed:
 * - new mail: fresh folder counts (unread, totals), fresh quota, and the open
 *   folder's newest messages
 * - flags changed elsewhere: update that message, then refresh the counts
 * - message removed: drop it locally, then refresh the counts
 */
export function LiveEmailSyncBridge() {
  const { isAuthenticated } = useSession();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  // The only place the sync timers run (cooldown tick + 5-minute auto-sync).
  useSyncScheduler();

  useEmailStream({
    onConnected: () => {
      // Connected to SSE stream
    },
    onMailboxChange: (data) => {
      if (!isAuthenticated) return;
      const { selectedAccountId, selectedFolderId } = useMailStore.getState();
      const changed = findRegisteredFolderByPath(data.path, selectedAccountId);

      queryClient.invalidateQueries({ queryKey: ['quota'] });

      void (async () => {
        // Counts first, so the folder's total is current when its messages are merged.
        await useFolderStore.getState().syncFolders(selectedAccountId, selectedFolderId);
        // Any other folder that changed is marked stale by that sync and fetches when opened.
        if (changed && changed.id === selectedFolderId) {
          await useMailStore.getState().refreshFolder(changed.id);
        }
      })();

      if (data.count > data.prevCount) {
        addToast({
          title: 'New Email Received',
          description: `Folder "${data.path}" updated (${data.count} messages)`,
          type: 'info',
        });
      }
    },
    onMailboxExpunge: (data) => {
      if (!isAuthenticated) return;
      const { selectedAccountId, selectedFolderId } = useMailStore.getState();
      const folder = findRegisteredFolderByPath(data.path, selectedAccountId);

      if (folder && data.uid) {
        useMailStore.getState().removeEmailFromFolder(folder.id, `msg-${data.uid}`);
      }
      queryClient.invalidateQueries({ queryKey: ['quota'] });
      useFolderStore.getState().syncFoldersSoon(selectedAccountId, selectedFolderId);
    },
    onMessageFlags: (data) => {
      if (!isAuthenticated || !data.uid || !data.flags) return;
      const { selectedAccountId, selectedFolderId, localEmails } = useMailStore.getState();
      const folder = findRegisteredFolderByPath(data.path, selectedAccountId);
      if (!folder) return;

      const emailId = `msg-${data.uid}`;
      const isRead = data.flags.includes('\\Seen');
      const isFlagged = data.flags.includes('\\Flagged');

      // Our own change echoing back already matches what is on screen: nothing to do.
      const known = localEmails.find((m) => m.folderId === folder.id && m.id === emailId);
      if (known && known.isRead === isRead && known.isFlagged === isFlagged) return;

      useMailStore.getState().applyMessageFlags(folder.id, emailId, { isRead, isFlagged });
      useFolderStore.getState().syncFoldersSoon(selectedAccountId, selectedFolderId);
    },
    onWarning: (data) => {
      console.warn('[AirSend Stream Warning]', data.message);
    },
  });

  return null;
}

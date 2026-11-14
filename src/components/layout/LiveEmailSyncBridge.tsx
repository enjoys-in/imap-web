'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/providers/SessionProvider';
import { useEmailStream } from '@/hooks/useEmailStream';
import { useSyncScheduler } from '@/hooks/useSyncManager';
import { useMailStore } from '@/stores/useMailStore';
import { useToastStore } from '@/stores/useToastStore';

/**
 * Global background sync bridge that listens to backend Server-Sent Events (/api/stream)
 * via IMAP IDLE and updates React Query caches and Zustand mail store in real time.
 */
export function LiveEmailSyncBridge() {
  const { isAuthenticated } = useSession();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const fetchEmails = useMailStore((s) => s.fetchEmails);

  // The only place the sync timers run (cooldown tick + 5-minute auto-sync).
  useSyncScheduler();

  useEmailStream({
    onConnected: () => {
      // Connected to SSE stream
    },
    onMailboxChange: (data) => {
      if (!isAuthenticated) return;
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['quota'] });

      fetchEmails();

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
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });

      if (data.uid) {
        const strUid = `msg-${data.uid}`;
        const currentList = useMailStore.getState().localEmails;
        useMailStore.setState({
          localEmails: currentList.filter((m) => m.id !== strUid && m.id !== String(data.uid)),
        });
      }
    },
    onMessageFlags: (data) => {
      if (!isAuthenticated) return;
      queryClient.invalidateQueries({ queryKey: ['emails'] });

      if (data.uid && data.flags) {
        const strUid = `msg-${data.uid}`;
        const isRead = data.flags.includes('\\Seen');
        const isFlagged = data.flags.includes('\\Flagged');
        const currentList = useMailStore.getState().localEmails;
        useMailStore.setState({
          localEmails: currentList.map((m) =>
            m.id === strUid || m.id === String(data.uid)
              ? { ...m, isRead, isFlagged }
              : m
          ),
        });
      }
    },
    onWarning: (data) => {
      console.warn('[AirSend Stream Warning]', data.message);
    },
  });

  return null;
}

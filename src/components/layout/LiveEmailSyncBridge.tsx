'use client';

import { useEffect } from 'react';
import { useSession } from '@/components/providers/SessionProvider';
import { useEmailStream } from '@/hooks/useEmailStream';
import { useSyncScheduler } from '@/hooks/useSyncManager';
import {
  handleMailboxChange,
  handleMailboxExpunge,
  handleMessageFlags,
  handleQuotaUpdate,
  shouldNotifyNewMail,
} from '@/lib/liveSync';
import { pingStreamPresence, startStreamPresence } from '@/lib/streamPresence';
import { useToastStore } from '@/stores/useToastStore';

export function LiveEmailSyncBridge() {
  const { isAuthenticated } = useSession();
  const addToast = useToastStore((s) => s.addToast);

  useSyncScheduler();

  useEffect(() => {
    if (!isAuthenticated) return;
    const presence = startStreamPresence();
    return () => presence.stop();
  }, [isAuthenticated]);

  useEmailStream({
    onConnected: () => {
      if (isAuthenticated) pingStreamPresence();
    },
    onMailboxChange: (data) => {
      if (!isAuthenticated) return;
      void handleMailboxChange(data);
      if (shouldNotifyNewMail(data)) {
        addToast({
          title: 'New Email Received',
          description: `Folder "${data.path}" updated (${data.count} messages)`,
          type: 'info',
        });
      }
    },
    onMailboxExpunge: (data) => {
      if (isAuthenticated) handleMailboxExpunge(data);
    },
    onMessageFlags: (data) => {
      if (isAuthenticated) handleMessageFlags(data);
    },
    onQuotaUpdate: (data) => {
      if (isAuthenticated) handleQuotaUpdate(data);
    },
    onWarning: (data) => {
      console.warn('[AirSend Stream Warning]', data.message);
    },
  });

  return null;
}

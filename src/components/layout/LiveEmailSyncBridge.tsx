'use client';

import { useSession } from '@/components/providers/SessionProvider';
import { useEmailStream } from '@/hooks/useEmailStream';
import { usePushSubscriptionSync } from '@/hooks/usePushSubscriptionSync';
import { useSyncScheduler } from '@/hooks/useSyncManager';
import {
  handleMailboxChange,
  handleMailboxExpunge,
  handleMessageFlags,
  handleQuotaUpdate,
  newMessageCount,
  shouldNotifyNewMail,
} from '@/lib/liveSync';
import { alertNewMail } from '@/lib/newMailAlert';
import { useToastStore } from '@/stores/useToastStore';

export function LiveEmailSyncBridge() {
  const { isAuthenticated } = useSession();
  const addToast = useToastStore((s) => s.addToast);

  useSyncScheduler();
  usePushSubscriptionSync(isAuthenticated);

  useEmailStream({
    onMailboxChange: (data) => {
      if (!isAuthenticated) return;
      void handleMailboxChange(data);
      if (shouldNotifyNewMail(data)) {
        addToast({
          title: 'New Email Received',
          description: `Folder "${data.path}" updated (${data.count} messages)`,
          type: 'info',
        });
        void alertNewMail(data, newMessageCount(data));
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

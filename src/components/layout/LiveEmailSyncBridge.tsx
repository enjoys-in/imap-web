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
import { useToastStore, ToastAction } from '@/stores/useToastStore';
import { useNotificationCenterStore } from '@/stores/useNotificationCenterStore';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { NOTIFICATION_ACTIONS } from '@/constants';

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
        const inAppActions = useGeneralSettingsStore.getState().notificationInAppActions || [
          NOTIFICATION_ACTIONS.OPEN,
          NOTIFICATION_ACTIONS.READ,
        ];
        const latestMsg = data.messages?.[data.messages.length - 1];

        const toastActions: ToastAction[] = inAppActions.map((act) => {
          switch (act) {
            case NOTIFICATION_ACTIONS.OPEN:
              return {
                label: 'Open',
                onClick: () => {
                  window.dispatchEvent(
                    new CustomEvent('airsend:open-folder', { detail: { path: data.path } })
                  );
                },
              };
            case NOTIFICATION_ACTIONS.READ:
              return {
                label: 'Mark as read',
                onClick: () => {
                  if (latestMsg?.uid) {
                    window.dispatchEvent(
                      new CustomEvent('airsend:mark-read', {
                        detail: { uid: latestMsg.uid, path: data.path },
                      })
                    );
                  }
                },
              };
            case NOTIFICATION_ACTIONS.DELETE:
              return {
                label: 'Delete',
                variant: 'danger',
                onClick: () => {
                  if (latestMsg?.uid) {
                    window.dispatchEvent(
                      new CustomEvent('airsend:delete-mail', {
                        detail: { uid: latestMsg.uid, path: data.path },
                      })
                    );
                  }
                },
              };
            case NOTIFICATION_ACTIONS.ARCHIVE:
              return {
                label: 'Archive',
                onClick: () => {
                  if (latestMsg?.uid) {
                    window.dispatchEvent(
                      new CustomEvent('airsend:archive-mail', {
                        detail: { uid: latestMsg.uid, path: data.path },
                      })
                    );
                  }
                },
              };
            case NOTIFICATION_ACTIONS.FLAG:
            default:
              return {
                label: 'Flag',
                onClick: () => {
                  if (latestMsg?.uid) {
                    window.dispatchEvent(
                      new CustomEvent('airsend:flag-mail', {
                        detail: { uid: latestMsg.uid, path: data.path },
                      })
                    );
                  }
                },
              };
          }
        });

        addToast({
          title: 'New Email Received',
          description: `Folder "${data.path}" updated (${data.count} messages)`,
          type: 'info',
          actions: toastActions,
        });
        void alertNewMail(data, newMessageCount(data));

        useNotificationCenterStore.getState().addNotification({
          title: latestMsg?.from ? `Email from ${latestMsg.from}` : 'New Email Received',
          detail: latestMsg?.subject || `Folder "${data.path}" updated with ${newMessageCount(data)} new message(s)`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'mail',
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

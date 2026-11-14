import type { MailboxChangeEventPayload } from '@/lib/api/handlers/stream';
import { showMailNotification } from '@/lib/webPush';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';

const isHidden = (): boolean => typeof document !== 'undefined' && document.visibilityState === 'hidden';

export async function alertNewMail(event: MailboxChangeEventPayload, count: number): Promise<boolean> {
  if (!isHidden() || count <= 0) return false;

  const { pushNotificationsEnabled, pushIncludePreview } = useGeneralSettingsStore.getState();
  if (!pushNotificationsEnabled) return false;

  const latest = event.messages?.[event.messages.length - 1];
  const preview = pushIncludePreview && latest;

  await showMailNotification({
    title: count > 1 ? `${count} new messages` : preview ? latest.from || 'New message' : 'New message',
    body: preview ? latest.subject || '(No subject)' : 'You have new email',
    tag: latest ? `airsend-${event.path}-${latest.uid}` : `airsend-${event.path}`,
    folder: event.path,
    uid: latest?.uid,
  });
  return true;
}

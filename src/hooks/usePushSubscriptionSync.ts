'use client';

import { useEffect } from 'react';
import { findRegisteredFolderByPath } from '@/lib/folders';
import { disablePush, enablePush, isPushSupported } from '@/lib/webPush';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useMailStore } from '@/stores/useMailStore';

interface OpenMailMessage {
  type: 'airsend:open-mail';
  folder?: string;
  uid?: number;
}

const isOpenMail = (data: unknown): data is OpenMailMessage =>
  typeof data === 'object' && data !== null && (data as { type?: unknown }).type === 'airsend:open-mail';

export function usePushSubscriptionSync(isAuthenticated: boolean): void {
  const enabled = useGeneralSettingsStore((s) => s.pushNotificationsEnabled);
  const audience = useGeneralSettingsStore((s) => s.pushNotificationAudience);
  const includePreview = useGeneralSettingsStore((s) => s.pushIncludePreview);

  useEffect(() => {
    if (!isAuthenticated || !isPushSupported() || Notification.permission !== 'granted') return;
    const run = enabled ? enablePush({ audience, includePreview }) : disablePush();
    void run.catch(() => undefined);
  }, [isAuthenticated, enabled, audience, includePreview]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (!isOpenMail(event.data) || typeof event.data.folder !== 'string') return;
      const { selectedAccountId, setSelectedFolder } = useMailStore.getState();
      const folder = findRegisteredFolderByPath(event.data.folder, selectedAccountId);
      if (folder) setSelectedFolder(folder.id);
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, []);
}

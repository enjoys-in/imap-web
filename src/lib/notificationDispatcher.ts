import { showWebPushNotification, requestWebPushPermission } from './webPush';
import { useToastStore, ToastType } from '@/stores/useToastStore';

export interface DispatchNotificationOptions {
  title: string;
  body?: string;
  type?: ToastType;
  tag?: string;
  onClick?: () => void;
}

/**
 * Checks if the user is currently focused on the active browser window/tab.
 */
export function isUserOnWindow(): boolean {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }
  return document.visibilityState === 'visible' && document.hasFocus();
}

/**
 * Dispatches notification according to window visibility & focus:
 * - If user is on window: ALWAYS In-App notification (Toast).
 * - If user is NOT on window: Web Push (Browser Desktop Notification).
 */
export function dispatchNotification({
  title,
  body,
  type = 'info',
  tag,
  onClick,
}: DispatchNotificationOptions) {
  const onWindow = isUserOnWindow();

  if (onWindow) {
    // User is active on window -> Show in-app notification
    useToastStore.getState().addToast({
      title,
      description: body,
      type,
    });
    return 'in-app';
  }

  // User is not on window (tab hidden / minimized / window blurred) -> Show Web Push
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          tag: tag || `notif-${Date.now()}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
        notif.onclick = () => {
          window.focus();
          onClick?.();
          notif.close();
        };
      } catch {
        // Fallback for strict browser environments
      }
    }
  }

  // Also queue in toast store so it appears upon returning to the tab
  useToastStore.getState().addToast({
    title,
    description: body,
    type,
  });

  return 'push';
}

export { requestWebPushPermission };

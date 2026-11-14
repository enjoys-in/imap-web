import { showWebPushNotification, requestWebPushPermission } from './webPush';
import { useToastStore, ToastType } from '@/stores/useToastStore';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';

export interface DispatchNotificationOptions {
  title: string;
  body?: string;
  type?: ToastType;
  tag?: string;
  onClick?: () => void;
  isDirect?: boolean;
  isVip?: boolean;
  isHighPriority?: boolean;
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
 * Dispatches notification according to window visibility & focus and user notification preferences:
 * - If user is on window: In-App notification (Toast) if enabled and matches audience rule.
 * - If user is NOT on window: Web Push (Browser Desktop Notification) if enabled and matches audience rule.
 */
export function dispatchNotification({
  title,
  body,
  type = 'info',
  tag,
  onClick,
  isDirect = true,
  isVip = false,
  isHighPriority = false,
}: DispatchNotificationOptions) {
  const onWindow = isUserOnWindow();
  const settings = useGeneralSettingsStore.getState();

  const passesAudience = (audience: 'all' | 'direct' | 'vip' | 'high_priority') => {
    switch (audience) {
      case 'all':
        return true;
      case 'direct':
        return isDirect;
      case 'vip':
        return isVip;
      case 'high_priority':
        return isHighPriority;
      default:
        return true;
    }
  };

  if (onWindow) {
    if (!settings.inAppNotificationsEnabled) {
      return null;
    }
    if (!passesAudience(settings.inAppNotificationAudience)) {
      return null;
    }

    // User is active on window -> Show in-app notification
    useToastStore.getState().addToast({
      title,
      description: body,
      type,
    });

    if (settings.inAppSoundEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch {}
    }

    return 'in-app';
  }

  // User is not on window (tab hidden / minimized / window blurred) -> Show Web Push
  if (!settings.pushNotificationsEnabled) {
    return null;
  }
  if (!passesAudience(settings.pushNotificationAudience)) {
    return null;
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: settings.pushIncludePreview ? body : 'New message arrived in AirSend',
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

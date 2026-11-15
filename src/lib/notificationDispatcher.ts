import { showWebPushNotification, requestWebPushPermission } from './webPush';
import { useToastStore, ToastType, ToastAction } from '@/stores/useToastStore';
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
  actions?: ToastAction[];
  duration?: number;
  alwaysShowToast?: boolean;
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
 * - If user is on window or alwaysShowToast is set: In-App notification (Toast) is rendered with actions & sound.
 * - If user is NOT on window: Web Push (Browser Desktop Notification) is triggered if enabled.
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
  actions,
  duration,
  alwaysShowToast = false,
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

  const playNotificationSound = () => {
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
  };

  // If user is on window or this alert explicitly requires an on-screen toast (e.g. meeting reminders)
  if (onWindow || alwaysShowToast) {
    const allowToast = alwaysShowToast || (settings.inAppNotificationsEnabled && passesAudience(settings.inAppNotificationAudience));
    if (allowToast) {
      useToastStore.getState().addToast({
        title,
        description: body,
        type,
        actions,
        duration,
        onClick,
      });
      playNotificationSound();
    }
    if (onWindow && !alwaysShowToast) {
      return allowToast ? 'in-app' : null;
    }
  }

  // User is not on window (or alwaysShowToast requested both toast + desktop push)
  if (!settings.pushNotificationsEnabled || !passesAudience(settings.pushNotificationAudience)) {
    return 'in-app';
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: settings.pushIncludePreview ? body : 'New alert in AirSend',
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

  // If user was not on window and alwaysShowToast wasn't already triggered, queue the toast for their return
  if (!onWindow && !alwaysShowToast) {
    useToastStore.getState().addToast({
      title,
      description: body,
      type,
      actions,
      duration,
      onClick,
    });
  }

  return 'push';
}

export { requestWebPushPermission };

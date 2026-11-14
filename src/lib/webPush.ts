import {
  getPushServerInfo,
  registerPushSubscription,
  sendTestPush,
  unregisterPushSubscription,
  type PushPreferences,
  type PushSubscriptionJson,
  type PushTestResult,
} from '@/lib/api/handlers/push';

export const PUSH_WORKER_URL = '/sw.js';
const NOTIFICATION_ICON = '/favicon.ico';

export type PushSetup = 'unsupported' | 'blocked' | 'unconfigured' | 'on';

export interface MailNotification {
  title: string;
  body: string;
  tag: string;
  folder?: string;
  uid?: number;
}

export async function requestWebPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  return false;
}

export function showWebPushNotification(title: string, options?: NotificationOptions) {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      new Notification(title, {
        icon: NOTIFICATION_ICON,
        badge: NOTIFICATION_ICON,
        ...options,
      });
    } catch {
      return;
    }
  }
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

const sameKey = (subscription: PushSubscription, key: Uint8Array): boolean => {
  const current = subscription.options?.applicationServerKey;
  if (!current) return false;
  const bytes = new Uint8Array(current);
  return bytes.length === key.length && bytes.every((byte, index) => byte === key[index]);
};

function serialize(subscription: PushSubscription): PushSubscriptionJson {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!json.endpoint || !p256dh || !auth) {
    throw new Error('The browser returned an incomplete push subscription');
  }
  return { endpoint: json.endpoint, keys: { p256dh, auth } };
}

async function registerWorker(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration('/');
  if (existing) return existing;
  await navigator.serviceWorker.register(PUSH_WORKER_URL, { scope: '/', updateViaCache: 'none' });
  return navigator.serviceWorker.ready;
}

export async function currentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration('/');
  return registration ? registration.pushManager.getSubscription() : null;
}

export async function enablePush(preferences: PushPreferences): Promise<PushSetup> {
  if (!isPushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  if (Notification.permission !== 'granted' && !(await requestWebPushPermission())) return 'blocked';

  const info = await getPushServerInfo();
  if (!info.configured || !info.publicKey) return 'unconfigured';

  const registration = await registerWorker();
  const key = urlBase64ToUint8Array(info.publicKey);

  let subscription = await registration.pushManager.getSubscription();
  if (subscription && !sameKey(subscription, key)) {
    await subscription.unsubscribe();
    subscription = null;
  }
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });
  }

  await registerPushSubscription(serialize(subscription), preferences);
  return 'on';
}

export async function disablePush(): Promise<void> {
  const subscription = await currentPushSubscription();
  if (!subscription) return;
  await unregisterPushSubscription(subscription.endpoint).catch(() => undefined);
  await subscription.unsubscribe().catch(() => false);
}

export async function sendTestNotification(): Promise<PushTestResult | null> {
  const subscription = await currentPushSubscription();
  return subscription ? sendTestPush(subscription.endpoint) : null;
}

export async function showMailNotification(mail: MailNotification): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  const options: NotificationOptions = {
    body: mail.body,
    tag: mail.tag,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    data: { url: '/', folder: mail.folder, uid: mail.uid },
  };
  try {
    const registration = isPushSupported()
      ? await navigator.serviceWorker.getRegistration('/')
      : undefined;
    if (registration) {
      await registration.showNotification(mail.title, options);
      return;
    }
  } catch {
    showWebPushNotification(mail.title, options);
    return;
  }
  showWebPushNotification(mail.title, options);
}

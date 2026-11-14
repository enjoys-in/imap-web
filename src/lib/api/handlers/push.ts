import { apiClient } from '../client';

export type PushAudience = 'all' | 'direct' | 'vip' | 'high_priority';

export interface PushServerInfo {
  configured: boolean;
  publicKey: string | null;
}

export interface PushPreferences {
  audience: PushAudience;
  includePreview: boolean;
}

export interface PushSubscriptionJson {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushTestResult {
  sent: number;
  gone: number;
  failed: number;
}

const resultOf = <T>(body: unknown): T => {
  if (body && typeof body === 'object' && 'result' in body) {
    return (body as { result: T }).result;
  }
  return body as T;
};

export async function getPushServerInfo(): Promise<PushServerInfo> {
  return resultOf<PushServerInfo>(await apiClient.get<unknown>('/push/public-key'));
}

export async function registerPushSubscription(
  subscription: PushSubscriptionJson,
  preferences: PushPreferences
): Promise<void> {
  await apiClient.post('/push/subscribe', {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    audience: preferences.audience,
    includePreview: preferences.includePreview,
  });
}

export async function unregisterPushSubscription(endpoint: string): Promise<void> {
  await apiClient.post('/push/unsubscribe', { endpoint });
}

export async function sendTestPush(endpoint?: string): Promise<PushTestResult> {
  return resultOf<PushTestResult>(await apiClient.post<unknown>('/push/test', endpoint ? { endpoint } : {}));
}

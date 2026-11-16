/**
 * AirSend Cross-Tab Communication Bus using BroadcastChannel API
 * Supports multi-tab coordination for authentication, session lifecycle,
 * data refresh, and cache invalidation while preserving per-tab workspace settings.
 */

export const CROSSTAB_CHANNEL_NAME = 'airsend_crosstab_channel';
export const CROSSTAB_STORAGE_FALLBACK_KEY = 'airsend_crosstab_event';

export const CROSSTAB_EVENTS = {
  LOGOUT: 'AIRSEND_LOGOUT',
  UNAUTHORIZED: 'AIRSEND_UNAUTHORIZED',
  SESSION_RESTORED: 'AIRSEND_SESSION_RESTORED',
  DATA_REFRESH: 'AIRSEND_DATA_REFRESH',
  EMAIL_MUTATED: 'AIRSEND_EMAIL_MUTATED',
  FOLDER_SYNC: 'AIRSEND_FOLDER_SYNC',
  SYNC_COMPLETED: 'AIRSEND_SYNC_COMPLETED',
  THEME_CHANGED: 'AIRSEND_THEME_CHANGED',
  CUSTOM_STATE: 'AIRSEND_CUSTOM_STATE',
} as const;

export type CrossTabEventType = (typeof CROSSTAB_EVENTS)[keyof typeof CROSSTAB_EVENTS];

export interface CrossTabMessage<T = any> {
  type: CrossTabEventType | string;
  senderTabId: string;
  timestamp: number;
  payload?: T;
}

/**
 * Unique Tab Identifier generated once per browser tab/session.
 * Enables tabs to filter out their own echo messages.
 */
export const CURRENT_TAB_ID: string = (() => {
  if (typeof window === 'undefined') return 'ssr';
  const win = window as unknown as { __AIRSEND_TAB_ID__?: string };
  if (!win.__AIRSEND_TAB_ID__) {
    win.__AIRSEND_TAB_ID__ = `tab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  return win.__AIRSEND_TAB_ID__;
})();

type MessageHandler<T = any> = (message: CrossTabMessage<T>) => void;

let channelInstance: BroadcastChannel | null = null;
const listeners = new Set<MessageHandler>();
let isListening = false;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channelInstance && typeof BroadcastChannel !== 'undefined') {
    try {
      channelInstance = new BroadcastChannel(CROSSTAB_CHANNEL_NAME);
    } catch {
      channelInstance = null;
    }
  }
  return channelInstance;
}

function handleIncomingRaw(data: any) {
  if (!data || typeof data !== 'object') return;
  const msg = data as CrossTabMessage;
  // Ignore messages sent by this exact tab
  if (msg.senderTabId === CURRENT_TAB_ID) return;

  listeners.forEach((listener) => {
    try {
      listener(msg);
    } catch (err) {
      console.error('[CrossTab] Listener error:', err);
    }
  });
}

function setupGlobalListeners() {
  if (isListening || typeof window === 'undefined') return;
  isListening = true;

  const channel = getBroadcastChannel();
  if (channel) {
    channel.onmessage = (event: MessageEvent) => {
      handleIncomingRaw(event.data);
    };
  }

  // LocalStorage storage event fallback (for browsers/environments where BroadcastChannel is constrained)
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === CROSSTAB_STORAGE_FALLBACK_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        handleIncomingRaw(parsed);
      } catch {}
    }
  });
}

/**
 * Broadcasts an event to all other open tabs in the same origin.
 */
export function broadcastCrossTab<T = any>(
  type: CrossTabEventType | string,
  payload?: T
): void {
  if (typeof window === 'undefined') return;

  const message: CrossTabMessage<T> = {
    type,
    senderTabId: CURRENT_TAB_ID,
    timestamp: Date.now(),
    payload,
  };

  // 1. Primary: BroadcastChannel Web API
  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage(message);
    } catch (err) {
      console.warn('[CrossTab] BroadcastChannel postMessage error:', err);
    }
  }

  // 2. Secondary fallback: LocalStorage storage event
  try {
    localStorage.setItem(CROSSTAB_STORAGE_FALLBACK_KEY, JSON.stringify(message));
    // Clear storage key after short delay to keep storage clean
    setTimeout(() => {
      try {
        if (localStorage.getItem(CROSSTAB_STORAGE_FALLBACK_KEY) === JSON.stringify(message)) {
          localStorage.removeItem(CROSSTAB_STORAGE_FALLBACK_KEY);
        }
      } catch {}
    }, 100);
  } catch {}
}

/**
 * Subscribes to cross-tab messages.
 * Returns an unsubscribe callback for clean unmounting.
 */
export function subscribeCrossTab<T = any>(
  handler: MessageHandler<T>
): () => void {
  setupGlobalListeners();
  listeners.add(handler as MessageHandler);

  return () => {
    listeners.delete(handler as MessageHandler);
  };
}

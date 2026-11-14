/**
 * Application-wide Route Paths
 */
export const ROUTES = {
  LOGIN: '/login',
  MAIL: '/mail',
  INBOX: '/mail/u/0#inbox',
  CALENDAR: '/calendar',
  SETTINGS: '/settings',
  SETTINGS_ACCOUNTS: '/settings/accounts',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_MAIL: '/settings/mail',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Storage Keys (localStorage & sessionStorage)
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'airsend_access_token',
  LOGGED_OUT: 'airsend_logged_out',
  ACTIVE_USER: 'airsend_active_user',
  CUSTOM_ACCOUNTS: 'airsend_custom_accounts',
  THEME: 'airsend_theme',
  LAST_MANUAL_SYNC: 'airsend_last_manual_sync_timestamp',
  LAST_AUTO_SYNC: 'airsend_last_auto_sync_timestamp',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Synchronization Intervals and Cooldowns
 */
export const SYNC_CONFIG = {
  MANUAL_COOLDOWN_MS: 2 * 60 * 1000, // 2 minutes cooldown between manual clicks
  AUTO_SYNC_INTERVAL_MS: 30 * 60 * 1000, // 30 minutes auto-sync interval for /sync-all
} as const;

/**
 * Application Custom Events
 */
export const APP_EVENTS = {
  UNAUTHORIZED: 'airsend:unauthorized',
  SESSION_EXPIRED: 'airsend:session:expired',
  SESSION_RESTORED: 'airsend:session:restored',
  THEME_CHANGED: 'airsend:theme:changed',
} as const;

export type AppEvent = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

/**
 * Event Map for type-safe event payloads with @enjoys/react-api/events
 */
export interface AppEventMap {
  [APP_EVENTS.UNAUTHORIZED]: { status?: number; message?: string } | undefined;
  [APP_EVENTS.SESSION_EXPIRED]: { reason?: string } | undefined;
  [APP_EVENTS.SESSION_RESTORED]: undefined;
  [APP_EVENTS.THEME_CHANGED]: { theme: string } | undefined;
}

/**
 * SSR-safe event dispatcher for non-React modules (e.g. API clients, stores)
 */
export function dispatchAppEvent<K extends AppEvent>(
  event: K,
  payload?: AppEventMap[K]
): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(event, { detail: payload }));
  }
}

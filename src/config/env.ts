/**
 * Server-side environment configuration for SSR / Node.js runtime only.
 * Client-side runtime configuration strictly comes from window.__RUNTIME_CONFIG__ (public/config.js).
 * ZERO usage of NEXT_PUBLIC_* variables.
 */
export interface AppConfig {
  baseUrl?: string;
  apiUrl: string;
  calendarApiUrl?: string;
  calendarUrl?: string;
  apiVersion?: string;
  appName: string;
  appVersion: string;
  nodeEnv: string;
  defaultTheme: 'dark' | 'light';
  enableWebPush: boolean;
}

export const env: AppConfig = {
  baseUrl: (process.env.BASE_URL || 'http://localhost:9503').replace(/\/+$/, ''),
  apiUrl: (process.env.API_URL || 'http://localhost:9503/api/v1/imap').replace(/\/+$/, ''),
  calendarApiUrl: (process.env.CALENDAR_API_URL || process.env.CALENDAR_URL || 'http://localhost:8443').replace(/\/+$/, ''),
  calendarUrl: (process.env.CALENDAR_URL || process.env.CALENDAR_API_URL || 'http://localhost:8443').replace(/\/+$/, ''),
  apiVersion: process.env.API_VERSION || 'v1',
  appName: process.env.APP_NAME || 'AirSend',
  appVersion: process.env.APP_VERSION || '1.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultTheme: 'dark',
  enableWebPush: process.env.ENABLE_WEBPUSH !== 'false',
};

// Safe server-to-client initial hydration configuration
export function getClientSafeConfig(): AppConfig {
  return {
    baseUrl: env.baseUrl,
    apiUrl: env.apiUrl,
    calendarApiUrl: env.calendarApiUrl,
    calendarUrl: env.calendarUrl,
    apiVersion: env.apiVersion,
    appName: env.appName,
    appVersion: env.appVersion,
    nodeEnv: env.nodeEnv,
    defaultTheme: env.defaultTheme,
    enableWebPush: env.enableWebPush,
  };
}

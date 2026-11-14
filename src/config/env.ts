// Server-side environment configuration for SSR (Node.js runtime)
export interface AppConfig {
  baseUrl?: string;
  apiUrl: string;
  apiVersion?: string;
  appName: string;
  appVersion: string;
  nodeEnv: string;
  defaultTheme: 'dark' | 'light';
  enableWebPush: boolean;
}

export const env: AppConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9503',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:9503/api/v1/imap',
  apiVersion: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  appName: process.env.APP_NAME || 'AirSend',
  appVersion: process.env.APP_VERSION || '1.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultTheme: 'dark',
  enableWebPush: process.env.ENABLE_WEBPUSH !== 'false',
};

// Safe client-shareable subset (no secrets)
export function getClientSafeConfig(): AppConfig {
  return {
    baseUrl: env.baseUrl,
    apiUrl: env.apiUrl,
    apiVersion: env.apiVersion,
    appName: env.appName,
    appVersion: env.appVersion,
    nodeEnv: env.nodeEnv,
    defaultTheme: env.defaultTheme,
    enableWebPush: env.enableWebPush,
  };
}

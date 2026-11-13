// Server-side environment configuration for SSR (Node.js runtime)
export interface AppConfig {
  apiUrl: string;
  appName: string;
  appVersion: string;
  nodeEnv: string;
  defaultTheme: 'dark' | 'light';
  enableWebPush: boolean;
}

export const env: AppConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:7654/api',
  appName: process.env.APP_NAME || 'AirSend',
  appVersion: process.env.APP_VERSION || '1.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultTheme: 'dark',
  enableWebPush: process.env.ENABLE_WEBPUSH !== 'false',
};

// Safe client-shareable subset (no secrets)
export function getClientSafeConfig(): AppConfig {
  return {
    apiUrl: env.apiUrl,
    appName: env.appName,
    appVersion: env.appVersion,
    nodeEnv: env.nodeEnv,
    defaultTheme: env.defaultTheme,
    enableWebPush: env.enableWebPush,
  };
}

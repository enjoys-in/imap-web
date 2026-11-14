// Server-side environment configuration for SSR (Node.js runtime)
export interface AppConfig {
  baseUrl: string;
  apiUrl: string;
  apiVersion: string;
  appName: string;
  appVersion: string;
  nodeEnv: string;
  defaultTheme: 'dark' | 'light';
  enableWebPush: boolean;
}

const defaultBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  'http://localhost:9503';

const defaultApiVersion =
  process.env.NEXT_PUBLIC_API_VERSION ||
  process.env.API_VERSION ||
  'v1';

const cleanBaseUrl = defaultBaseUrl.replace(/\/+$/, '').replace(/\/api(\/v\d+)?\/?$/, '');

const defaultApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  `${cleanBaseUrl}/api/${defaultApiVersion}`;

export const env: AppConfig = {
  baseUrl: cleanBaseUrl,
  apiUrl: defaultApiUrl.replace(/\/+$/, ''),
  apiVersion: defaultApiVersion,
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

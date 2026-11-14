import type { AppConfig } from './env';

// Default in-memory configuration store for client-side execution
const DEFAULT_CLIENT_CONFIG: AppConfig = {
  baseUrl: 'http://localhost:9503',
  apiUrl: 'http://localhost:9503/api/v1/imap',
  apiVersion: 'v1',
  appName: 'AirSend',
  appVersion: '1.0.0',
  nodeEnv: 'production',
  defaultTheme: 'dark',
  enableWebPush: true,
};

let memoryConfig: AppConfig = { ...DEFAULT_CLIENT_CONFIG };

export function setMemoryConfig(config: Partial<AppConfig>) {
  memoryConfig = {
    ...memoryConfig,
    ...config,
  };
}

/**
 * Returns active runtime configuration on the client side.
 * Loaded strictly from window.__RUNTIME_CONFIG__ (injected via public/config.js).
 */
export function getClientConfig(): AppConfig {
  let active = { ...memoryConfig };
  if (typeof window !== 'undefined') {
    const runtime = (window as unknown as { __RUNTIME_CONFIG__?: Partial<AppConfig> }).__RUNTIME_CONFIG__;
    if (runtime) {
      active = { ...active, ...runtime };
    }
  }

  // Use apiUrl directly as configured, only trimming trailing slashes
  const apiUrl = (
    active.apiUrl ||
    `${(active.baseUrl || 'http://localhost:9503').replace(/\/+$/, '')}/api/v1`
  ).replace(/\/+$/, '');

  const baseUrl = (
    active.baseUrl ||
    apiUrl.replace(/\/api(\/.*)?$/, '') ||
    'http://localhost:9503'
  ).replace(/\/+$/, '');

  return {
    ...active,
    baseUrl,
    apiUrl,
  };
}

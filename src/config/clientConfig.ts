import { AppConfig, env } from './env';

// In-memory runtime configuration store for client-side execution
let memoryConfig: AppConfig = {
  baseUrl: env.baseUrl,
  apiUrl: env.apiUrl,
  apiVersion: env.apiVersion,
  appName: env.appName,
  appVersion: env.appVersion,
  nodeEnv: env.nodeEnv,
  defaultTheme: env.defaultTheme,
  enableWebPush: env.enableWebPush,
};

export function setMemoryConfig(config: Partial<AppConfig>) {
  memoryConfig = {
    ...memoryConfig,
    ...config,
  };
}

export function getClientConfig(): AppConfig {
  let active = { ...memoryConfig };
  if (typeof window !== 'undefined') {
    const runtime = (window as unknown as { __RUNTIME_CONFIG__?: Partial<AppConfig> }).__RUNTIME_CONFIG__;
    if (runtime) {
      active = { ...active, ...runtime };
    }
  }

  // Ensure baseUrl is normal domain (no /api or /v1 suffix)
  const rawBase = (active.baseUrl || active.apiUrl || 'http://localhost:9503').replace(/\/+$/, '');
  const baseUrl = rawBase.replace(/\/api(\/v\d+)?\/?$/, '');
  const apiVersion = active.apiVersion || 'v1';

  // Ensure apiUrl always has /api/v1 (or /api/${apiVersion}) prefix over any path
  let apiUrl = active.apiUrl ? active.apiUrl.replace(/\/+$/, '') : `${baseUrl}/api/${apiVersion}`;
  if (!apiUrl.includes('/api/')) {
    apiUrl = apiUrl.endsWith('/api') ? `${apiUrl}/${apiVersion}` : `${apiUrl}/api/${apiVersion}`;
  }

  return {
    ...active,
    baseUrl,
    apiUrl,
    apiVersion,
  };
}

export function isLiveApiAvailable(): boolean {
  const config = getClientConfig();
  return Boolean(config.apiUrl);
}

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

export function isLiveApiAvailable(): boolean {
  const config = getClientConfig();
  return Boolean(config.apiUrl);
}

import { AppConfig } from './env';

// In-memory runtime configuration store for client-side execution
let memoryConfig: AppConfig = {
  apiUrl: '',
  appName: 'AirSend',
  appVersion: '1.0.0',
  nodeEnv: 'development',
  defaultTheme: 'dark',
  enableWebPush: true,
};

export function setMemoryConfig(config: Partial<AppConfig>) {
  memoryConfig = {
    ...memoryConfig,
    ...config,
  };
}

export function getClientConfig(): AppConfig {
  if (typeof window !== 'undefined') {
    const runtime = (window as unknown as { __RUNTIME_CONFIG__?: Partial<AppConfig> }).__RUNTIME_CONFIG__;
    if (runtime) {
      return { ...memoryConfig, ...runtime };
    }
  }
  return memoryConfig;
}

export function isLiveApiAvailable(): boolean {
  const config = getClientConfig();
  return Boolean(config.apiUrl && !config.apiUrl.includes('3001'));
}

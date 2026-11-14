'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppConfig } from '@/config/env';
import { setMemoryConfig, getClientConfig } from '@/config/clientConfig';

const ConfigContext = createContext<AppConfig>(getClientConfig());

export function useConfig(): AppConfig {
  return useContext(ConfigContext);
}

interface ConfigProviderProps {
  initialConfig?: AppConfig;
  children: React.ReactNode;
}

export function ConfigProvider({ initialConfig, children }: ConfigProviderProps) {
  const [config, setConfig] = useState<AppConfig>(() => {
    if (initialConfig) {
      setMemoryConfig(initialConfig);
    }
    return getClientConfig();
  });

  useEffect(() => {
    const active = getClientConfig();
    setConfig(active);
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

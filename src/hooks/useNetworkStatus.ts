'use client';

import { useState, useEffect } from 'react';
import { getCachedCount } from '@/lib/idb/mailCacheDb';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cachedEmailsCount, setCachedEmailsCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getCachedCount().then(setCachedEmailsCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, cachedEmailsCount, refreshCacheCount: () => getCachedCount().then(setCachedEmailsCount) };
}

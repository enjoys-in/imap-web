'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AirSendSplashScreen } from '@/components/layout/AirSendSplashScreen';
import { accountsApi } from '@/api';
import { Account } from '@/types';

interface SessionContextType {
  account: Account | null;
  isLoading: boolean;
  statusText: string;
}

const SessionContext = createContext<SessionContextType>({
  account: null,
  isLoading: false,
  statusText: '',
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [statusText, setStatusText] = useState('Fetching user session...');

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      // If already marked as loaded in this browser tab, restore session seamlessly
      if (typeof window !== 'undefined' && sessionStorage.getItem('airsend_session_ready')) {
        const list = await accountsApi.getAccounts();
        if (isMounted) {
          setAccount(list[0] || null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setStatusText('Fetching user session...');
        await new Promise((res) => setTimeout(res, 500));

        const accounts = await accountsApi.getAccounts();
        if (isMounted) {
          setAccount(accounts[0] || null);
          setStatusText('Synchronizing mailbox folders...');
          await new Promise((res) => setTimeout(res, 250));
        }
      } catch {
        if (isMounted) {
          const fallback = await accountsApi.getAccounts();
          setAccount(fallback[0] || null);
        }
      } finally {
        if (isMounted) {
          sessionStorage.setItem('airsend_session_ready', 'true');
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <AirSendSplashScreen statusMessage={statusText} />;
  }

  return (
    <SessionContext.Provider value={{ account, isLoading, statusText }}>
      {children}
    </SessionContext.Provider>
  );
}

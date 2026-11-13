'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AirSendSplashScreen } from '@/components/layout/AirSendSplashScreen';
import { accountsApi, clearAuthToken } from '@/lib/api';
import { Account } from '@/types';

interface SessionContextType {
  account: Account | null;
  accounts: Account[];
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  statusText: string;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  account: null,
  accounts: [],
  user: null,
  isAuthenticated: false,
  isLoading: true,
  statusText: '',
  refreshSession: async () => {},
  logout: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoginPage, setIsLoginPage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      setIsLoginPage(true);
      setIsLoading(false);
    }
  }, []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [statusText, setStatusText] = useState('Fetching user session...');

  const refreshSession = useCallback(async () => {
    try {
      setStatusText('Validating connection...');
      const profile = await accountsApi.getProfile();

      if (profile && (profile.email || profile.mid)) {
        setUser(profile.user || profile);
        setIsAuthenticated(true);

        const list = await accountsApi.getAccounts();
        setAccounts(list);
        setAccount(list[0] || null);

        if (isLoginPage) {
          router.push('/mail/u/0/#inbox');
        }
        return;
      }
      throw new Error('Not authenticated');
    } catch {
      setUser(null);
      setAccount(null);
      setAccounts([]);
      setIsAuthenticated(false);

      if (!isLoginPage) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoginPage, router]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (isLoginPage) {
        setIsLoading(false);
        return;
      }

      try {
        setStatusText('Fetching user session...');
        const profile = await accountsApi.getProfile();

        if (isMounted && profile && (profile.email || profile.mid)) {
          setUser(profile.user || profile);
          setIsAuthenticated(true);

          setStatusText('Synchronizing mailbox folders...');
          const list = await accountsApi.getAccounts();
          if (isMounted) {
            setAccounts(list);
            setAccount(list[0] || null);
          }
        } else {
          throw new Error('Not authenticated');
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setAccount(null);
          router.push('/login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isLoginPage, router]);

  const logout = useCallback(async () => {
    try {
      await accountsApi.logout();
    } finally {
      clearAuthToken();
      setUser(null);
      setAccount(null);
      setAccounts([]);
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  if (isLoading && !isLoginPage) {
    return <AirSendSplashScreen statusMessage={statusText} />;
  }

  return (
    <SessionContext.Provider
      value={{
        account,
        accounts,
        user,
        isAuthenticated,
        isLoading,
        statusText,
        refreshSession,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

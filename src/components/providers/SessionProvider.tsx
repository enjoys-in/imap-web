'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AirSendSplashScreen } from '@/components/layout/AirSendSplashScreen';
import { accountsApi, clearAuthToken } from '@/lib/api';
import { accountsQuery } from '@/hooks/useEmailsQuery';
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
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isLoginPage = pathname === '/login';

  const [isLoading, setIsLoading] = useState(!isLoginPage);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [statusText, setStatusText] = useState('Fetching user session...');

  // Set once a session has loaded, so a route change (e.g. login -> mail) does not load it again.
  const sessionLoadedRef = useRef(false);

  /**
   * Loads the profile (`/me`) and the accounts. Accounts go through the shared
   * react-query entry, so later `useAccounts()` consumers reuse this result
   * instead of calling `/accounts` again.
   */
  const loadSession = useCallback(
    async (options: { force?: boolean; onProfile?: () => void } = {}) => {
      const profile = await accountsApi.getProfile();
      if (!(profile && (profile.email || profile.mid))) {
        throw new Error('Not authenticated');
      }
      options.onProfile?.();
      const list = await queryClient.fetchQuery({
        ...accountsQuery,
        staleTime: options.force ? 0 : accountsQuery.staleTime,
      });
      return { profile, list };
    },
    [queryClient]
  );

  const applySession = useCallback(
    (profile: any, list: Account[]) => {
      sessionLoadedRef.current = true;
      setUser(profile.user || profile);
      setAccounts(list);
      setAccount(list[0] || null);
      setIsAuthenticated(true);
    },
    []
  );

  const clearSession = useCallback(() => {
    sessionLoadedRef.current = false;
    setUser(null);
    setAccount(null);
    setAccounts([]);
    setIsAuthenticated(false);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('airsend_logged_out');
      }
      setStatusText('Validating connection...');
      const { profile, list } = await loadSession({ force: true });
      applySession(profile, list);

      if (isLoginPage) {
        router.push('/mail/u/0#inbox');
      }
    } catch {
      clearSession();

      if (!isLoginPage) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoginPage, router, loadSession, applySession, clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (isLoginPage || sessionLoadedRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        setStatusText('Fetching user session...');
        const { profile, list } = await loadSession({
          onProfile: () => {
            if (isMounted) setStatusText('Synchronizing mailbox folders...');
          },
        });
        if (isMounted) {
          applySession(profile, list);
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
  }, [isLoginPage, router, loadSession, applySession]);

  const logout = useCallback(async () => {
    try {
      await accountsApi.logout();
    } finally {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('airsend_logged_out', 'true');
      }
      // Cached server data belongs to the signed-out mailbox.
      queryClient.clear();
      clearSession();
      router.push('/login');
    }
  }, [router, queryClient, clearSession]);

  // Stable identity: consumers re-render only when session data actually changes.
  const value = useMemo<SessionContextType>(
    () => ({
      account,
      accounts,
      user,
      isAuthenticated,
      isLoading,
      statusText,
      refreshSession,
      logout,
    }),
    [account, accounts, user, isAuthenticated, isLoading, statusText, refreshSession, logout]
  );

  if (isLoading && !isLoginPage) {
    return <AirSendSplashScreen statusMessage={statusText} />;
  }

  // Prevent flashing internal protected children if user is not authenticated
  if (!isAuthenticated && !isLoginPage) {
    return <AirSendSplashScreen statusMessage="Redirecting to sign in..." />;
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

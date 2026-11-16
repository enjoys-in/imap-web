'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEventListener } from '@enjoys/react-api/events';
import { AirSendSplashScreen } from '@/components/layout/AirSendSplashScreen';
import { accountsApi, clearAuthToken, getAuthToken } from '@/lib/api';
import { accountsQuery } from '@/hooks/useEmailsQuery';
import { ingestSessionPayload } from '@/lib/ingestSession';
import { useFolderStore } from '@/stores/useFolderStore';
import { useMailStore } from '@/stores/useMailStore';
import { Account } from '@/types';
import { ROUTES, STORAGE_KEYS, APP_EVENTS, type AppEventMap } from '@/constants';
import { SessionContext, SessionContextType, useSession } from './sessionContext';

export { useSession };

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isLoginPage = pathname === ROUTES.LOGIN;

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [statusText, setStatusText] = useState('Verifying session...');

  const sessionLoadedRef = useRef(false);

  const loadSession = useCallback(
    async (options: { force?: boolean; onProfile?: () => void } = {}) => {
      const profile = await accountsApi.getProfile({ force: options.force });
      if (!(profile && (profile.email || profile.mid))) {
        throw new Error('Not authenticated');
      }
      options.onProfile?.();
      const list = await queryClient.fetchQuery({
        ...accountsQuery,
        queryFn: () =>
          accountsApi.getAccounts({ refresh: options.force, forEmail: profile.email }),
        staleTime: options.force ? 0 : accountsQuery.staleTime,
      });
      await ingestSessionPayload(profile, { queryClient, accountId: list[0]?.id });
      return { profile, list };
    },
    [queryClient]
  );

  const applySession = useCallback((profile: any, list: Account[]) => {
    sessionLoadedRef.current = true;
    setUser(profile.user || profile);
    setAccounts(list);
    setAccount(list[0] || null);
    setIsAuthenticated(true);
  }, []);

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
        sessionStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
      }
      setStatusText('Validating connection...');
      const { profile, list } = await loadSession({ force: true });
      applySession(profile, list);

      if (isLoginPage) {
        router.replace(ROUTES.INBOX);
      }
    } catch {
      clearSession();
      if (!isLoginPage) {
        router.replace(ROUTES.LOGIN);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoginPage, router, loadSession, applySession, clearSession]);

  // If user is already authenticated and visits /login, redirect immediately to inbox
  useEffect(() => {
    if (isAuthenticated && isLoginPage) {
      router.replace(ROUTES.INBOX);
    }
  }, [isAuthenticated, isLoginPage, router]);

  // Listen for unauthorized 401 events via @enjoys/react-api custom event listener hook
  useEventListener<AppEventMap, typeof APP_EVENTS.UNAUTHORIZED>(
    APP_EVENTS.UNAUTHORIZED,
    () => {
      clearAuthToken();
      clearSession();
      if (!isLoginPage) {
        router.replace(ROUTES.LOGIN);
      }
    }
  );

  useEffect(() => {
    let isMounted = true;

    async function init() {
      // If already loaded and authenticated, handle route guarding
      if (sessionLoadedRef.current) {
        if (isLoginPage && isAuthenticated) {
          router.replace(ROUTES.INBOX);
        }
        setIsLoading(false);
        return;
      }

      // If user is on the login page: check if they are already logged in
      if (isLoginPage) {
        const token = getAuthToken();
        const isExplicitlyLoggedOut =
          typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEYS.LOGGED_OUT) === 'true';

        // Only skip if explicitly logged out and no token exists in cookies or localStorage
        if (isExplicitlyLoggedOut && !token) {
          setIsLoading(false);
          setIsAuthenticated(false);
          return;
        }

        // Validate session via /me while splash screen is rendered
        try {
          setIsLoading(true);
          setStatusText('Verifying session...');
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(STORAGE_KEYS.LOGGED_OUT);
          }
          const { profile, list } = await loadSession({ force: true });
          if (isMounted) {
            applySession(profile, list);
            router.replace(ROUTES.INBOX);
          }
        } catch {
          // me 401 or invalid session: clear the token cookie and storage, show login
          if (isMounted) {
            clearAuthToken();
            clearSession();
            setIsLoading(false);
          }
        }
        return;
      }

      // User is on a protected route: authenticate or fall back to /login
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
        // Not authenticated: clear token and redirect to login
        if (isMounted) {
          clearAuthToken();
          clearSession();
          router.replace(ROUTES.LOGIN);
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
  }, [isLoginPage, router, loadSession, applySession, clearSession, isAuthenticated]);

  const logout = useCallback(async () => {
    try {
      await accountsApi.logout();
    } finally {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEYS.LOGGED_OUT, 'true');
      }
      queryClient.clear();
      useFolderStore.getState().reset();
      useMailStore.setState({
        localEmails: [],
        selectedAccountId: '',
        selectedFolderId: '',
        selectedMailId: null,
        selectedIds: [],
        searchQuery: '',
        serverSearchResults: null,
        lastSnapshot: null,
      });
      clearSession();
      router.replace(ROUTES.LOGIN);
    }
  }, [router, queryClient, clearSession]);

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

  return (
    <SessionContext.Provider value={value}>
      {children}
      {/* If authenticated user navigates to /login: show redirecting overlay */}
      {isAuthenticated && isLoginPage && (
        <div className="fixed inset-0 z-50">
          <AirSendSplashScreen statusMessage="Redirecting to your mailbox..." />
        </div>
      )}
      {/* If verifying session on /login */}
      {isLoading && isLoginPage && (
        <div className="fixed inset-0 z-50">
          <AirSendSplashScreen statusMessage={statusText} />
        </div>
      )}
      {/* Protected route loading */}
      {isLoading && !isLoginPage && (
        <div className="fixed inset-0 z-50">
          <AirSendSplashScreen statusMessage={statusText} />
        </div>
      )}
      {/* Protected route fallback when unauthenticated */}
      {!isLoading && !isAuthenticated && !isLoginPage && (
        <div className="fixed inset-0 z-50">
          <AirSendSplashScreen statusMessage="Redirecting to sign in..." />
        </div>
      )}
    </SessionContext.Provider>
  );
}

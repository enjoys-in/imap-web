'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  CROSSTAB_EVENTS,
  CURRENT_TAB_ID,
  subscribeCrossTab,
  type CrossTabMessage,
} from '@/lib/broadcast/crossTabChannel';
import { clearAuthToken } from '@/lib/api/tokenStorage';
import { useSession } from './sessionContext';
import { useFolderStore } from '@/stores/useFolderStore';
import { useMailStore } from '@/stores/useMailStore';
import { useToastStore } from '@/stores/useToastStore';
import { ROUTES, STORAGE_KEYS } from '@/constants';

interface CrossTabSyncProviderProps {
  children: React.ReactNode;
}

/**
 * CrossTabSyncProvider coordinates multi-tab application state:
 * - Synchronizes global authentication state (LOGOUT, UNAUTHORIZED) across all tabs.
 * - Synchronizes background data refreshes and cache invalidation.
 * - STRICT ISOLATION: Preserves tab-local workspace settings (selectedAccountId,
 *   selectedFolderId, selectedMailId, active workspace tabs) so each tab operates
 *   in its own independent view without cross-tab interference.
 */
export function CrossTabSyncProvider({ children }: CrossTabSyncProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { clearSession, refreshSession, isAuthenticated } = useSession();
  const isLoginPage = pathname === ROUTES.LOGIN;

  const handleCrossTabLogout = useCallback(
    (reason = 'Signed out in another tab') => {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(STORAGE_KEYS.LOGGED_OUT, 'true');
        } catch {}
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

      if (!isLoginPage) {
        useToastStore.getState().addToast({
          title: 'Signed Out',
          description: reason,
          type: 'info',
          duration: 4000,
        });
        router.replace(ROUTES.LOGIN);
      }
    },
    [clearSession, isLoginPage, queryClient, router]
  );

  useEffect(() => {
    const unsubscribe = subscribeCrossTab((message: CrossTabMessage) => {
      switch (message.type) {
        case CROSSTAB_EVENTS.LOGOUT: {
          handleCrossTabLogout('You have been signed out from another tab.');
          break;
        }

        case CROSSTAB_EVENTS.UNAUTHORIZED: {
          handleCrossTabLogout('Session expired or unauthorized in another window.');
          break;
        }

        case CROSSTAB_EVENTS.SESSION_RESTORED: {
          // If this tab was waiting on the login page and another tab authenticated:
          if (isLoginPage) {
            refreshSession();
          }
          break;
        }

        case CROSSTAB_EVENTS.DATA_REFRESH: {
          // Refresh shared caches via React Query invalidation
          const domain = message.payload?.domain;
          if (!domain || domain === 'all') {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
          } else if (domain === 'emails') {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
          } else if (domain === 'folders') {
            queryClient.invalidateQueries({ queryKey: ['folders'] });
          } else if (domain === 'calendar') {
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
          }

          // If payload targets the currently open folder in this tab, gently refresh its stored emails
          const currentFolderId = useMailStore.getState().selectedFolderId;
          const targetFolderId = message.payload?.folderId;
          if (targetFolderId && currentFolderId === targetFolderId) {
            useMailStore.getState().refreshFolder(targetFolderId, { stored: true }).catch(() => {});
          }

          // WORKSPACE SETTINGS PRESERVATION:
          // Notice we DO NOT modify selectedAccountId, selectedFolderId, or selectedMailId!
          // Tab X and Tab Y maintain their distinct email workspace context.
          break;
        }

        case CROSSTAB_EVENTS.EMAIL_MUTATED: {
          const { action, emailId, folderId, patch } = message.payload || {};
          const currentFolder = useMailStore.getState().selectedFolderId;

          if (action === 'read' || action === 'unread') {
            const isRead = action === 'read';
            if (folderId && emailId) {
              if (currentFolder === folderId) {
                useMailStore.getState().applyMessageFlags(folderId, emailId, { isRead });
              }
              useFolderStore.getState().bumpUnread(folderId, isRead ? -1 : 1);
            }
          } else if (action === 'delete' && emailId) {
            if (currentFolder === folderId) {
              useMailStore.getState().removeEmailFromFolder(folderId || currentFolder, emailId);
            }
            if (folderId) {
              useFolderStore.getState().bumpUnread(folderId, -1);
            }
          } else if (action === 'flag' && emailId && folderId) {
            if (currentFolder === folderId && patch) {
              useMailStore.getState().applyMessageFlags(folderId, emailId, patch);
            }
          }
          break;
        }

        case CROSSTAB_EVENTS.THEME_CHANGED: {
          const theme = message.payload?.theme;
          if (theme && typeof document !== 'undefined') {
            if (theme === 'light') {
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
            }
          }
          break;
        }

        default:
          break;
      }
    });

    return unsubscribe;
  }, [handleCrossTabLogout, isLoginPage, queryClient, refreshSession]);

  return <>{children}</>;
}

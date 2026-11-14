'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMailStore, useToastStore, useSyncStore, useFolderStore, AUTO_SYNC_INTERVAL_MS } from '@/stores';
import { foldersApi } from '@/lib/api';

function useSyncCore() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const fetchEmails = useMailStore((s) => s.fetchEmails);

  const isSyncing = useSyncStore((s) => s.isSyncing);
  const isBlocked = useSyncStore((s) => s.isBlocked);
  const cooldownRemaining = useSyncStore((s) => s.cooldownRemaining);
  const lastManualSyncTime = useSyncStore((s) => s.lastManualSyncTime);
  const lastAutoSyncTime = useSyncStore((s) => s.lastAutoSyncTime);
  const setIsSyncing = useSyncStore((s) => s.setIsSyncing);
  const recordManualSync = useSyncStore((s) => s.recordManualSync);
  const recordAutoSync = useSyncStore((s) => s.recordAutoSync);

  // Formatted countdown: "2:00", "1:45", "0:08"
  const formattedCooldown = useMemo(() => {
    if (cooldownRemaining <= 0) return '';
    const m = Math.floor(cooldownRemaining / 60);
    const s = cooldownRemaining % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, [cooldownRemaining]);

  const executeSync = useCallback(
    async (options?: { isAuto?: boolean; notify?: boolean }) => {
      const isAuto = options?.isAuto ?? false;
      const notify = options?.notify ?? !isAuto;

      const currentState = useSyncStore.getState();
      if (!isAuto && (currentState.isBlocked || currentState.isSyncing)) {
        return false;
      }
      if (currentState.isSyncing) {
        return false;
      }

      setIsSyncing(true);
      if (!isAuto) {
        recordManualSync();
      } else {
        recordAutoSync();
      }

      try {
        await foldersApi.syncCompleteMailbox();

        // Invalidate React Query caches for immediate UI update
        await useFolderStore.getState().syncFolders(selectedAccountId, selectedFolderId);
        queryClient.invalidateQueries({ queryKey: ['emails'] });
        queryClient.invalidateQueries({ queryKey: ['quota'] });
        queryClient.invalidateQueries({ queryKey: ['connection-status'] });

        // Update current folder emails
        await fetchEmails(selectedFolderId, selectedAccountId || undefined, { force: true });

        if (notify) {
          addToast({
            title: 'Mailbox Synced',
            description: 'Folder updated with latest messages from IMAP server.',
            type: 'success',
          });
        }
        return true;
      } catch {
        if (notify) {
          addToast({
            title: 'Sync Failed',
            description: 'Failed to synchronize with IMAP server.',
            type: 'error',
          });
        }
        return false;
      } finally {
        setTimeout(() => {
          setIsSyncing(false);
        }, 500);
      }
    },
    [fetchEmails, selectedFolderId, selectedAccountId, queryClient, addToast, setIsSyncing, recordManualSync, recordAutoSync]
  );

  const triggerManualSync = useCallback(() => {
    return executeSync({ isAuto: false, notify: true });
  }, [executeSync]);

  const triggerAutoSync = useCallback(() => {
    return executeSync({ isAuto: true, notify: false });
  }, [executeSync]);

  return {
    isSyncing,
    isBlocked,
    cooldownRemaining,
    formattedCooldown,
    lastManualSyncTime,
    lastAutoSyncTime,
    triggerManualSync,
    triggerAutoSync,
  };
}

export function useSyncManager() {
  return useSyncCore();
}

export function useSyncScheduler(): void {
  const { triggerAutoSync } = useSyncCore();
  const updateCooldown = useSyncStore((s) => s.updateCooldown);

  // Cooldown countdown tick every 1s
  useEffect(() => {
    updateCooldown();
    const interval = setInterval(() => {
      updateCooldown();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateCooldown]);

  // Auto-sync every 30 minutes (1,800,000ms)
  useEffect(() => {
    const checkAndAutoSync = () => {
      const lastSync = Math.max(
        useSyncStore.getState().lastAutoSyncTime || 0,
        useSyncStore.getState().lastManualSyncTime || 0
      );
      const elapsed = Date.now() - lastSync;
      if (lastSync > 0 && elapsed >= AUTO_SYNC_INTERVAL_MS) {
        triggerAutoSync();
      }
    };

    const autoSyncInterval = setInterval(() => {
      checkAndAutoSync();
    }, 60000); // Check every 60s

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndAutoSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(autoSyncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [triggerAutoSync]);
}

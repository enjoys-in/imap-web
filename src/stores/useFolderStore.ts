'use client';

import { create } from 'zustand';
import type { MailFolder } from '@/types';
import { foldersApi } from '@/lib/api';
import { getCachedFolders, replaceCachedFolders } from '@/lib/idb/mailCacheDb';
import { folderLabel, replaceRegisteredFolders, clearRegisteredFolders } from '@/lib/folders';

/** A folder list synced less than this long ago is not requested again. */
const FOLDER_FRESH_MS = 30_000;

interface FolderState {
  /** Folders per account id, exactly as the backend classified them (labels normalized for display). */
  byAccount: Record<string, MailFolder[]>;
  syncedAt: Record<string, number>;

  /** Show the local copy at once, then refresh from the backend unless it was synced recently. */
  ensureFolders: (accountId: string) => Promise<MailFolder[]>;
  /** Fetch from the backend now. The backend list replaces the local copy. */
  syncFolders: (accountId: string) => Promise<MailFolder[]>;
  reset: () => void;
}

/** Display label only; ids, paths and `special` stay exactly as the backend sent them. */
function withLabels(accountId: string, folders: MailFolder[]): MailFolder[] {
  return folders.map((f) => ({
    ...f,
    accountId: f.accountId || accountId,
    displayName: folderLabel(f.displayName || f.fullName),
  }));
}

// One request per account at a time, however many components ask.
const inflightSync = new Map<string, Promise<MailFolder[]>>();

export const useFolderStore = create<FolderState>((set, get) => {
  const apply = (accountId: string, folders: MailFolder[], synced: boolean) => {
    const labelled = withLabels(accountId, folders);
    replaceRegisteredFolders(accountId, labelled);
    set((s) => ({
      byAccount: { ...s.byAccount, [accountId]: labelled },
      syncedAt: synced ? { ...s.syncedAt, [accountId]: Date.now() } : s.syncedAt,
    }));
    return labelled;
  };

  return {
    byAccount: {},
    syncedAt: {},

    ensureFolders: async (accountId) => {
      if (!accountId) return [];

      if (!get().byAccount[accountId]) {
        const cached = await getCachedFolders(accountId);
        // The backend may have answered while the local copy was loading.
        if (cached.length > 0 && !get().byAccount[accountId]) apply(accountId, cached, false);
      }

      const lastSync = get().syncedAt[accountId] ?? 0;
      if (Date.now() - lastSync < FOLDER_FRESH_MS) {
        return get().byAccount[accountId] ?? [];
      }
      return get().syncFolders(accountId);
    },

    syncFolders: (accountId) => {
      if (!accountId) return Promise.resolve([]);
      const pending = inflightSync.get(accountId);
      if (pending) return pending;

      const request = (async () => {
        try {
          const fromBackend = await foldersApi.getFolders(accountId);
          await replaceCachedFolders(accountId, fromBackend);
          return apply(accountId, fromBackend, true);
        } catch {
          // Offline or server error: keep showing the last known copy.
          return get().byAccount[accountId] ?? [];
        } finally {
          inflightSync.delete(accountId);
        }
      })();

      inflightSync.set(accountId, request);
      return request;
    },

    reset: () => {
      inflightSync.clear();
      clearRegisteredFolders();
      set({ byAccount: {}, syncedAt: {} });
    },
  };
});

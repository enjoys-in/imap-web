'use client';

import { create } from 'zustand';
import type { MailFolder } from '@/types';
import { foldersApi } from '@/lib/api';
import {
  getCachedFolders,
  replaceCachedFolders,
  getFolderSyncStates,
  invalidateFolderSync,
} from '@/lib/idb/mailCacheDb';
import { folderLabel, replaceRegisteredFolders, clearRegisteredFolders } from '@/lib/folders';

/** Bursts of server events (flags, expunges) are folded into one folder sync. */
const SYNC_SOON_MS = 400;

interface FolderState {
  /** Folders per account id, exactly as the backend classified them (labels normalized for display). */
  byAccount: Record<string, MailFolder[]>;
  /**
   * Unread changes made locally since the last backend sync, per folder id. The
   * sidebar shows backend `unreadCount + delta`, so it reacts instantly; the
   * next sync replaces the base and clears the deltas.
   */
  unreadDelta: Record<string, number>;

  /**
   * Load an account's folders without asking the backend when they are already
   * known (in memory, or stored locally from an earlier fetch). The backend is
   * only asked the first time.
   */
  ensureFolders: (accountId: string) => Promise<MailFolder[]>;
  /**
   * Fetch from the backend now (a server event, a manual sync, a folder was
   * created/renamed/deleted). The backend list replaces the local copy.
   * `openFolderId` is the folder on screen: it is kept current by events and
   * local actions, so it is not marked stale when its count changes.
   */
  syncFolders: (accountId: string, openFolderId?: string) => Promise<MailFolder[]>;
  /** Like `syncFolders`, but waits briefly so a burst of events costs one request. */
  syncFoldersSoon: (accountId: string, openFolderId?: string) => void;

  bumpUnread: (folderId: string, delta: number) => void;
  /** All messages in the folder were marked read. */
  clearUnread: (folderId: string) => void;
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
const soonTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useFolderStore = create<FolderState>((set, get) => {
  /** Puts a folder list in the store (and the registry the API layer reads). */
  const apply = (accountId: string, folders: MailFolder[], fromBackend: boolean) => {
    const labelled = withLabels(accountId, folders);
    replaceRegisteredFolders(accountId, labelled);
    set((s) => {
      let unreadDelta = s.unreadDelta;
      if (fromBackend) {
        // The backend counts are the new base: forget local adjustments for this account.
        const previousIds = new Set((s.byAccount[accountId] ?? []).map((f) => f.id));
        unreadDelta = Object.fromEntries(Object.entries(s.unreadDelta).filter(([id]) => !previousIds.has(id)));
      }
      return { byAccount: { ...s.byAccount, [accountId]: labelled }, unreadDelta };
    });
    return labelled;
  };

  /**
   * A folder whose message count differs from when we fetched it has changed
   * on the server: forget its fetched marker so the next open asks the backend.
   */
  const markChangedFoldersStale = async (accountId: string, folders: MailFolder[], openFolderId?: string) => {
    const states = await getFolderSyncStates(accountId);
    await Promise.all(
      folders.map(async (folder) => {
        const state = states.find((st) => st.folderId === folder.id);
        if (!state || folder.id === openFolderId) return;
        if (state.totalCount !== (Number(folder.totalCount) || 0)) await invalidateFolderSync(folder.id);
      })
    );
  };

  return {
    byAccount: {},
    unreadDelta: {},

    ensureFolders: async (accountId) => {
      if (!accountId) return [];

      const loaded = get().byAccount[accountId];
      if (loaded) return loaded;

      const stored = await getCachedFolders(accountId);
      if (stored.length > 0) {
        // Another caller may have loaded them while we read the local copy.
        return get().byAccount[accountId] ?? apply(accountId, stored, false);
      }

      // Nothing local yet: the first time ever.
      return get().syncFolders(accountId);
    },

    syncFolders: (accountId, openFolderId) => {
      if (!accountId) return Promise.resolve([]);
      const pending = inflightSync.get(accountId);
      if (pending) return pending;

      const request = (async () => {
        try {
          const fromBackend = await foldersApi.getFolders(accountId);
          await replaceCachedFolders(accountId, fromBackend);
          await markChangedFoldersStale(accountId, fromBackend, openFolderId);
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

    syncFoldersSoon: (accountId, openFolderId) => {
      if (!accountId) return;
      const existing = soonTimers.get(accountId);
      if (existing) clearTimeout(existing);
      soonTimers.set(
        accountId,
        setTimeout(() => {
          soonTimers.delete(accountId);
          void get().syncFolders(accountId, openFolderId);
        }, SYNC_SOON_MS)
      );
    },

    bumpUnread: (folderId, delta) => {
      if (!folderId || !delta) return;
      set((s) => ({ unreadDelta: { ...s.unreadDelta, [folderId]: (s.unreadDelta[folderId] ?? 0) + delta } }));
    },

    clearUnread: (folderId) => {
      if (!folderId) return;
      set((s) => {
        const folder = Object.values(s.byAccount)
          .flat()
          .find((f) => f.id === folderId);
        if (!folder) return s;
        return { unreadDelta: { ...s.unreadDelta, [folderId]: -(Number(folder.unreadCount) || 0) } };
      });
    },

    reset: () => {
      inflightSync.clear();
      for (const timer of soonTimers.values()) clearTimeout(timer);
      soonTimers.clear();
      clearRegisteredFolders();
      set({ byAccount: {}, unreadDelta: {} });
    },
  };
});

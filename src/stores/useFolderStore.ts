'use client';

import { create } from 'zustand';
import type { MailFolder } from '@/types';
import { foldersApi } from '@/lib/api';
import {
  getCachedFolders,
  replaceCachedFolders,
  updateCachedFolderCounts,
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
  /**
   * Take a folder list the backend already sent (with `/authenticate`, `/validate` or
   * `/me`) instead of asking for it again. Nothing is written when it matches what is
   * stored; when only counts differ just those folders' counts are updated; the list
   * is rewritten only when folders were added, removed or changed identity.
   */
  applyServerFolders: (accountId: string, folders: MailFolder[], openFolderId?: string) => Promise<MailFolder[]>;

  bumpUnread: (folderId: string, delta: number) => void;
  /** All messages in the folder were marked read. Returns how many were showing as unread, so the change can be undone. */
  clearUnread: (folderId: string) => number;
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

type FolderChange = 'same' | 'counts' | 'structure';

const countOf = (value: unknown) => Number(value) || 0;

/** How the backend's list differs from the one held: nothing, only message counts, or the folders themselves. */
function diffFolders(held: MailFolder[], incoming: MailFolder[]): FolderChange {
  if (held.length !== incoming.length) return 'structure';
  const byId = new Map(held.map((f) => [f.id, f]));
  let counts = false;
  for (const f of incoming) {
    const h = byId.get(f.id);
    if (
      !h ||
      h.fullName !== f.fullName ||
      h.displayName !== f.displayName ||
      h.special !== f.special ||
      (h.parentFullName ?? null) !== (f.parentFullName ?? null) ||
      h.uidValidity !== f.uidValidity ||
      h.sortRank !== f.sortRank
    ) {
      return 'structure';
    }
    if (countOf(h.unreadCount) !== countOf(f.unreadCount) || countOf(h.totalCount) !== countOf(f.totalCount)) {
      counts = true;
    }
  }
  return counts ? 'counts' : 'same';
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
          return await get().applyServerFolders(accountId, fromBackend, openFolderId);
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

    applyServerFolders: async (accountId, incoming, openFolderId) => {
      if (!accountId) return [];
      const labelled = withLabels(accountId, incoming);
      // What is held now: the in-memory list, else the stored copy.
      const held = get().byAccount[accountId] ?? withLabels(accountId, await getCachedFolders(accountId));
      const change = diffFolders(held, labelled);

      if (change === 'structure') {
        await replaceCachedFolders(accountId, incoming);
      } else if (change === 'counts') {
        const heldById = new Map(held.map((f) => [f.id, f]));
        await updateCachedFolderCounts(
          labelled.filter((f) => {
            const h = heldById.get(f.id);
            return !h || countOf(h.unreadCount) !== countOf(f.unreadCount) || countOf(h.totalCount) !== countOf(f.totalCount);
          })
        );
      }
      // A different message count means that folder changed on the server since its messages were fetched.
      if (change !== 'same') await markChangedFoldersStale(accountId, incoming, openFolderId);

      if (change === 'same') {
        const current = get().byAccount[accountId];
        // First list after a reload: register it. Otherwise nothing to store or re-render.
        if (!current) return apply(accountId, incoming, true);
        // The backend's counts are the base again: drop local unread adjustments, if there are any.
        const ids = new Set(current.map((f) => f.id));
        if (Object.keys(get().unreadDelta).some((id) => ids.has(id))) {
          set((s) => ({ unreadDelta: Object.fromEntries(Object.entries(s.unreadDelta).filter(([id]) => !ids.has(id))) }));
        }
        return current;
      }
      return apply(accountId, incoming, true);
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
      if (!folderId) return 0;
      const state = get();
      const folder = Object.values(state.byAccount)
        .flat()
        .find((f) => f.id === folderId);
      if (!folder) return 0;
      const base = Number(folder.unreadCount) || 0;
      const shown = Math.max(0, base + (state.unreadDelta[folderId] ?? 0));
      set((s) => ({ unreadDelta: { ...s.unreadDelta, [folderId]: -base } }));
      return shown;
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

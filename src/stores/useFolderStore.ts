'use client';

import { create } from 'zustand';
import type { MailFolder } from '@/types';
import { foldersApi } from '@/lib/api';
import {
  getCachedFolders,
  replaceCachedFolders,
  updateCachedFolderCounts,
  getFolderSyncState,
  getFolderSyncStates,
  invalidateFolderSync,
} from '@/lib/idb/mailCacheDb';
import { folderLabel, replaceRegisteredFolders, clearRegisteredFolders } from '@/lib/folders';

const SYNC_SOON_MS = 400;

export interface FolderCounts {
  unread: number;
  total: number;
}

export interface ServerFolderCounts {
  path: string;
  totalCount: number;
  unreadCount: number;
}

interface FolderState {
  byAccount: Record<string, MailFolder[]>;

  ensureFolders: (accountId: string) => Promise<MailFolder[]>;
  syncFolders: (accountId: string, openFolderId?: string) => Promise<MailFolder[]>;
  syncFoldersSoon: (accountId: string, openFolderId?: string) => void;
  applyServerFolders: (accountId: string, folders: MailFolder[], openFolderId?: string) => Promise<MailFolder[]>;

  adjustCounts: (folderId: string, change: Partial<FolderCounts>) => void;
  applyServerCounts: (counts: readonly ServerFolderCounts[], openFolderId?: string) => Promise<void>;
  bumpUnread: (folderId: string, delta: number) => void;
  clearUnread: (folderId: string) => number;
  clearCounts: (folderId: string) => FolderCounts;
  reset: () => void;
}

function withLabels(accountId: string, folders: MailFolder[]): MailFolder[] {
  return folders.map((f) => ({
    ...f,
    accountId: f.accountId || accountId,
    displayName: folderLabel(f.displayName || f.fullName),
  }));
}

type FolderChange = 'same' | 'counts' | 'structure';

const countOf = (value: unknown) => Number(value) || 0;

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

function keepHeldCounts(held: MailFolder[] | undefined, incoming: MailFolder[]): MailFolder[] {
  if (!held) return incoming;
  const byId = new Map(held.map((f) => [f.id, f]));
  return incoming.map((f) => {
    const h = byId.get(f.id);
    return h ? { ...f, unreadCount: h.unreadCount, totalCount: h.totalCount } : f;
  });
}

const inflightSync = new Map<string, Promise<MailFolder[]>>();
const soonTimers = new Map<string, ReturnType<typeof setTimeout>>();
const countEpoch = new Map<string, number>();

export const useFolderStore = create<FolderState>((set, get) => {
  const apply = (accountId: string, folders: MailFolder[]) => {
    const labelled = withLabels(accountId, folders);
    replaceRegisteredFolders(accountId, labelled);
    set((s) => ({ byAccount: { ...s.byAccount, [accountId]: labelled } }));
    return labelled;
  };

  const locate = (folderId: string) => {
    for (const [accountId, list] of Object.entries(get().byAccount)) {
      const index = list.findIndex((f) => f.id === folderId);
      if (index !== -1) return { accountId, list, index, folder: list[index] };
    }
    return null;
  };

  const locateByPath = (path: string) => {
    for (const list of Object.values(get().byAccount)) {
      const folder = list.find((f) => f.fullName === path);
      if (folder) return folder;
    }
    return null;
  };

  const adjust = (folderId: string, unreadChange: number, totalChange: number): void => {
    const at = locate(folderId);
    if (!at) return;
    const { accountId, list, index, folder } = at;
    const unreadCount = Math.max(0, countOf(folder.unreadCount) + unreadChange);
    const totalCount = Math.max(0, countOf(folder.totalCount) + totalChange);
    if (unreadCount === countOf(folder.unreadCount) && totalCount === countOf(folder.totalCount)) return;

    const next = list.slice();
    next[index] = { ...folder, unreadCount, totalCount };
    replaceRegisteredFolders(accountId, next);
    countEpoch.set(accountId, (countEpoch.get(accountId) ?? 0) + 1);
    set((s) => ({ byAccount: { ...s.byAccount, [accountId]: next } }));
    void updateCachedFolderCounts([{ id: folderId, unreadCount, totalCount }]);
  };

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

    ensureFolders: async (accountId) => {
      if (!accountId) return [];

      const loaded = get().byAccount[accountId];
      if (loaded) return loaded;

      const stored = await getCachedFolders(accountId);
      if (stored.length > 0) {
        return get().byAccount[accountId] ?? apply(accountId, stored);
      }

      return get().syncFolders(accountId);
    },

    syncFolders: (accountId, openFolderId) => {
      if (!accountId) return Promise.resolve([]);
      const pending = inflightSync.get(accountId);
      if (pending) return pending;

      const request = (async () => {
        const requestedAt = countEpoch.get(accountId) ?? 0;
        try {
          const fromBackend = await foldersApi.getFolders(accountId);
          const outdated = (countEpoch.get(accountId) ?? 0) !== requestedAt;
          const list = outdated ? keepHeldCounts(get().byAccount[accountId], fromBackend) : fromBackend;
          const applied = await get().applyServerFolders(accountId, list, openFolderId);
          if (outdated) get().syncFoldersSoon(accountId, openFolderId);
          return applied;
        } catch {
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
      if (change !== 'same') await markChangedFoldersStale(accountId, incoming, openFolderId);

      if (change === 'same') {
        return get().byAccount[accountId] ?? apply(accountId, incoming);
      }
      return apply(accountId, incoming);
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

    adjustCounts: (folderId, change) => {
      if (folderId) adjust(folderId, change.unread ?? 0, change.total ?? 0);
    },

    applyServerCounts: async (counts, openFolderId) => {
      for (const { path, totalCount, unreadCount } of counts) {
        const folder = locateByPath(path);
        if (!folder) continue;
        adjust(folder.id, unreadCount - countOf(folder.unreadCount), totalCount - countOf(folder.totalCount));
        if (folder.id === openFolderId) continue;
        const state = await getFolderSyncState(folder.id);
        if (state && state.totalCount !== totalCount) await invalidateFolderSync(folder.id);
      }
    },

    bumpUnread: (folderId, delta) => {
      if (folderId && delta) adjust(folderId, delta, 0);
    },

    clearUnread: (folderId) => {
      const at = folderId ? locate(folderId) : null;
      if (!at) return 0;
      const shown = countOf(at.folder.unreadCount);
      adjust(folderId, -shown, 0);
      return shown;
    },

    clearCounts: (folderId) => {
      const at = folderId ? locate(folderId) : null;
      if (!at) return { unread: 0, total: 0 };
      const before = { unread: countOf(at.folder.unreadCount), total: countOf(at.folder.totalCount) };
      adjust(folderId, -before.unread, -before.total);
      return before;
    },

    reset: () => {
      inflightSync.clear();
      for (const timer of soonTimers.values()) clearTimeout(timer);
      soonTimers.clear();
      clearRegisteredFolders();
      countEpoch.clear();
      set({ byAccount: {} });
    },
  };
});

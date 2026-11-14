import { create } from 'zustand';
import { MailMessageMetadata } from '@/types';
import { emailsApi, foldersApi } from '@/lib/api';
import {
  saveCachedEmails,
  deleteCachedEmails,
  patchCachedEmail,
  invalidateFolderSync,
  clearFolderCache,
  shiftFolderSyncTotal,
} from '@/lib/idb/mailCacheDb';
import { loadFolderEmails, loadMoreFolderEmails, newestFirst, refreshFolderEmails } from '@/lib/mailSync';
import type { MutationResult } from '@/lib/api/handlers/messageRequest';
import { isServerMessageId, messageKey } from '@/lib/messageKey';
import { setInboxQuota } from '@/lib/queryClientRef';
import { holdRemoval, settleRemoval } from '@/lib/pendingRemovals';
import { getOpenMailSession } from '@/lib/storage/mailSessionStorage';
import { getRegisteredFolder } from '@/lib/folders';
import { useGeneralSettingsStore } from './useGeneralSettingsStore';
import { useFolderStore } from './useFolderStore';
import { useToastStore } from './useToastStore';

export type MailFilterTab = 'all' | 'unread' | 'flagged' | 'attachments' | 'pinned';
export type MailSortField = 'date' | 'from' | 'subject' | 'size';
export type MailSortDirection = 'desc' | 'asc';

interface MailState {
  selectedAccountId: string;
  selectedAccountIndex: number;
  selectedFolderId: string;
  selectedMailId: string | null;
  filterTab: MailFilterTab;
  sortField: MailSortField;
  sortDirection: MailSortDirection;
  searchQuery: string;
  isSearchingServer: boolean;
  serverSearchResults: MailMessageMetadata[] | null;
  selectedIds: string[];
  localEmails: MailMessageMetadata[];
  isLoadingEmails: boolean;
  emailPage: number;
  hasMoreEmails: boolean;
  isLoadingMore: boolean;
  lastSnapshot: MailMessageMetadata[] | null;

  fetchEmails: (folderId?: string, accountId?: string, options?: { force?: boolean }) => Promise<void>;
  refreshFolder: (folderId: string, options?: { stored?: boolean }) => Promise<void>;
  applyMessageFlags: (folderId: string, emailId: string, patch: Partial<MailMessageMetadata>) => void;
  removeEmailFromFolder: (folderId: string, emailId: string) => void;
  loadMoreEmails: () => Promise<void>;
  setSortConfig: (field: MailSortField, direction: MailSortDirection) => void;
  setLocalEmails: (emails: MailMessageMetadata[]) => void;
  addOrSelectEmail: (email: MailMessageMetadata) => void;
  setSelectedAccount: (id: string) => void;
  setSelectedAccountIndex: (index: number) => void;
  setSelectedFolder: (id: string) => void;
  setSelectedMail: (id: string | null) => void;
  setFilterTab: (tab: MailFilterTab) => void;
  setSearchQuery: (query: string) => void;
  executeServerSearch: (query: string, folderId?: string) => Promise<void>;
  clearSearch: () => void;
  toggleSelectId: (id: string) => void;
  selectAllIds: (ids: string[]) => void;
  clearSelectedIds: () => void;
  toggleFlag: (id: string) => void;
  togglePin: (id: string) => void;
  markAsRead: (id: string, isRead?: boolean) => void;
  markFolderAsRead: (folderId: string) => void;
  emptyFolder: (folderId: string) => Promise<{ success: boolean; message: string }>;
  deleteEmail: (id: string, folderId?: string) => void;
  moveEmailToFolder: (emailId: string, folderId: string) => void;
  copyEmailToFolder: (emailId: string, folderId: string) => void;
  categorizeEmail: (emailId: string, category: string | null) => void;
  snoozeEmail: (id: string, untilText: string) => void;
  bulkDelete: () => void;
  bulkMarkAsRead: (isRead: boolean) => void;
  bulkMoveToFolder: (folderId: string) => void;
  bulkToggleFlag: (isFlagged?: boolean) => void;
  undoLastAction: () => boolean;
}

function getInitialState() {
  let initialFolder = '';
  let initialMailId: string | null = null;

  if (typeof window !== 'undefined') {
    const saved = getOpenMailSession(0);
    if (saved) {
      if (saved.folderId) initialFolder = saved.folderId;
      if (saved.mailId) initialMailId = saved.mailId;
    }
  }

  return {
    selectedAccountId: '',
    selectedAccountIndex: 0,
    selectedFolderId: initialFolder,
    selectedMailId: initialMailId,
    localEmails: [] as MailMessageMetadata[],
    isLoadingEmails: false,
  };
}

const initialState = getInitialState();

let latestFetchId = 0;

let suppressPersist = false;
function quietly(update: () => void): void {
  suppressPersist = true;
  try {
    update();
  } finally {
    suppressPersist = false;
  }
}

export const useMailStore = create<MailState>((set, get) => ({
  selectedAccountId: initialState.selectedAccountId,
  selectedAccountIndex: initialState.selectedAccountIndex,
  selectedFolderId: initialState.selectedFolderId,
  selectedMailId: initialState.selectedMailId,
  filterTab: 'all',
  sortField: 'date',
  sortDirection: 'desc',
  searchQuery: '',
  isSearchingServer: false,
  serverSearchResults: null,
  selectedIds: [],
  localEmails: initialState.localEmails,
  isLoadingEmails: false,
  emailPage: 1,
  hasMoreEmails: true,
  isLoadingMore: false,
  lastSnapshot: null,

  setSortConfig: (field, direction) => set({ sortField: field, sortDirection: direction }),

  fetchEmails: async (folderId, accountId, options) => {
    const fId = folderId || get().selectedFolderId;
    const aId = accountId || get().selectedAccountId || '';
    const folder = getRegisteredFolder(fId);
    if (!fId || !folder) return;

    const requestId = ++latestFetchId;
    set({ isLoadingEmails: true });
    try {
      const result = await loadFolderEmails(folder, aId || undefined, { force: options?.force });
      if (requestId !== latestFetchId) return;
      quietly(() =>
        set({
          localEmails: result.emails,
          emailPage: result.pagesLoaded,
          hasMoreEmails: result.hasMore,
          isLoadingEmails: false,
        })
      );
    } catch {
      if (requestId === latestFetchId) set({ isLoadingEmails: false });
    }
  },

  loadMoreEmails: async () => {
    if (get().isLoadingMore || !get().hasMoreEmails) return;
    const nextPage = get().emailPage + 1;
    const fId = get().selectedFolderId;
    const aId = get().selectedAccountId || '';
    const folder = getRegisteredFolder(fId);
    if (!folder) return;
    set({ isLoadingMore: true });
    try {
      const { fresh, hasMore } = await loadMoreFolderEmails(folder, aId || undefined, nextPage);
      if (get().selectedFolderId !== fId || get().selectedAccountId !== aId) {
        set({ isLoadingMore: false });
        return;
      }
      const current = get().localEmails;
      const currentIds = new Set(current.map((e) => e.id));
      const merged = [...current, ...fresh.filter((e) => !currentIds.has(e.id))];
      quietly(() =>
        set({ localEmails: merged, emailPage: nextPage, hasMoreEmails: hasMore, isLoadingMore: false })
      );
    } catch {
      set({ isLoadingMore: false });
    }
  },

  refreshFolder: async (folderId, options) => {
    const folder = getRegisteredFolder(folderId);
    if (!folder) return;
    try {
      const result = await refreshFolderEmails(folder, folder.accountId || undefined, options);
      if (get().selectedFolderId === folderId) {
        quietly(() =>
          set({ localEmails: result.emails, emailPage: result.pagesLoaded, hasMoreEmails: result.hasMore })
        );
      }
    } catch {
    }
  },

  applyMessageFlags: (folderId, emailId, patch) => {
    void patchCachedEmail(folderId, emailId, patch);
    quietly(() =>
      set((s) => ({
        localEmails: s.localEmails.map((m) =>
          m.folderId === folderId && m.id === emailId ? { ...m, ...patch } : m
        ),
      }))
    );
  },

  removeEmailFromFolder: (folderId, emailId) => {
    void deleteCachedEmails(folderId, [emailId]);
    set((s) => ({
      localEmails: s.localEmails.filter((m) => !(m.folderId === folderId && m.id === emailId)),
      selectedMailId: s.selectedMailId === emailId ? null : s.selectedMailId,
    }));
  },

  setLocalEmails: (localEmails) => set({ localEmails }),
  addOrSelectEmail: (email) => set((s) => ({
    localEmails: s.localEmails.some((e) => e.id === email.id) ? s.localEmails : [email, ...s.localEmails],
    selectedMailId: email.id,
  })),
  setSelectedAccount: (id) => set((s) => {
    if (s.selectedAccountId === id) return s;
    if (!s.selectedAccountId) return { selectedAccountId: id };
    return {
      selectedAccountId: id,
      localEmails: [],
      emailPage: 1,
      hasMoreEmails: true,
      selectedMailId: null,
      selectedFolderId: '',
      selectedIds: [],
    };
  }),
  setSelectedAccountIndex: (index) => set({ selectedAccountIndex: index }),
  setSelectedFolder: (id) => set((s) => {
    if (s.selectedFolderId === id) return s;
    const inFolder = s.localEmails.some((e) => e.folderId === id && e.id === s.selectedMailId);
    const folderEmails = s.localEmails.filter((e) => e.folderId === id);
    return {
      selectedFolderId: id,
      selectedMailId: inFolder ? s.selectedMailId : (folderEmails[0]?.id || null),
      selectedIds: [],
      emailPage: 1,
      hasMoreEmails: folderEmails.length >= 25,
    };
  }),
  setSelectedMail: (id) => {
    const current = get().localEmails.find((m) => m.id === id);
    if (get().selectedMailId === id && (!id || current?.isRead)) {
      return;
    }
    set((s) => ({
      selectedMailId: id,
      localEmails: id ? s.localEmails.map((m) => (m.id === id ? { ...m, isRead: true } : m)) : s.localEmails,
    }));
    if (id && current && !current.isRead) {
      settleFlags(emailsApi.markAsRead(id, true, current.folderId || get().selectedFolderId));
      useFolderStore.getState().bumpUnread(current.folderId, -1);
    }
  },
  setFilterTab: (filterTab) => set({ filterTab }),
  setSearchQuery: (searchQuery) => {
    if (!searchQuery.trim()) {
      set({ searchQuery: '', serverSearchResults: null, isSearchingServer: false });
    } else {
      set({ searchQuery });
    }
  },
  clearSearch: () => set({ searchQuery: '', serverSearchResults: null, isSearchingServer: false }),
  executeServerSearch: async (query: string, folderId?: string) => {
    const q = query.trim();
    if (!q) {
      set({ serverSearchResults: null, isSearchingServer: false });
      return;
    }
    const folder = folderId || get().selectedFolderId || 'INBOX';
    set({ isSearchingServer: true });
    try {
      const res = await emailsApi.searchEmails(q, folder);
      if (get().searchQuery.trim() === q) {
        set({ serverSearchResults: res.emails, isSearchingServer: false });
      }
    } catch {
      set({ isSearchingServer: false });
    }
  },

  toggleSelectId: (id) => set((s) => ({
    selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((item) => item !== id) : [...s.selectedIds, id],
  })),
  selectAllIds: (ids) => set({ selectedIds: ids }),
  clearSelectedIds: () => set({ selectedIds: [] }),

  toggleFlag: (id) => {
    const email = get().localEmails.find((m) => m.id === id);
    const newFlag = email ? !email.isFlagged : true;
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => (m.id === id ? { ...m, isFlagged: newFlag } : m)),
    }));
    settleFlags(emailsApi.toggleFlag(id, newFlag, email?.folderId || get().selectedFolderId));
  },
  togglePin: (id) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m)),
  })),
  markAsRead: (id, isRead) => {
    const email = get().localEmails.find((m) => m.id === id);
    const nextRead = isRead !== undefined ? isRead : email ? !email.isRead : true;
    const folder = email?.folderId || get().selectedFolderId;
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => (m.id === id ? { ...m, isRead: nextRead } : m)),
    }));
    settleFlags(emailsApi.markAsRead(id, nextRead, folder));
    if (email && email.isRead !== nextRead) {
      useFolderStore.getState().bumpUnread(email.folderId, nextRead ? -1 : 1);
    }
  },
  markFolderAsRead: (folderId) => {
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => (m.folderId === folderId ? { ...m, isRead: true } : m)),
    }));
    settleFlags(emailsApi.markAllAsRead(folderId));
    useFolderStore.getState().clearUnread(folderId);
  },
  emptyFolder: async (folderId) => {
    const removed = get().localEmails.filter((m) => m.folderId === folderId);
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.filter((m) => m.folderId !== folderId),
      selectedMailId: null,
      selectedIds: [],
    }));
    const before = useFolderStore.getState().clearCounts(folderId);

    const result = await foldersApi.emptyFolder(folderId);
    if (result.success) {
      await clearFolderCache(folderId);
    } else {
      quietly(() =>
        set((s) => {
          const present = new Set(s.localEmails.map((m) => `${m.folderId}|${m.id}`));
          const missing = removed.filter((m) => !present.has(`${m.folderId}|${m.id}`));
          return { localEmails: [...s.localEmails, ...missing].sort(newestFirst) };
        })
      );
      useFolderStore.getState().adjustCounts(folderId, before);
    }
    return { success: result.success, message: result.message };
  },
  deleteEmail: (id, folderId) => {
    const email = get().localEmails.find((m) => m.id === id && (!folderId || m.folderId === folderId));
    const folder = folderId || email?.folderId || get().selectedFolderId;
    set((s) => {
      const idx = s.localEmails.findIndex((m) => m.id === id);
      const nextEmails = s.localEmails.filter((m) => m.id !== id);
      let nextSelected: string | null = s.selectedMailId;
      if (s.selectedMailId === id) {
        const afterAction = useGeneralSettingsStore.getState().afterMoveOrDelete;
        if (afterAction === 'openNext') {
          nextSelected = nextEmails[idx]?.id || nextEmails[idx - 1]?.id || null;
        } else if (afterAction === 'openPrevious') {
          nextSelected = nextEmails[idx - 1]?.id || nextEmails[idx]?.id || null;
        } else {
          nextSelected = null;
        }
      }
      return {
        lastSnapshot: s.localEmails,
        localEmails: nextEmails,
        selectedMailId: nextSelected,
      };
    });
    void runRemoval({
      items: [{ folderId: folder, id }],
      rows: email ? [email] : [],
      send: (from, ids) => emailsApi.bulkDeleteEmails(ids, from),
      failureTitle: 'Could not delete',
    });
  },
  moveEmailToFolder: (emailId, folderId) => {
    const email = get().localEmails.find((m) => m.id === emailId);
    const sourceFolder = email?.folderId || get().selectedFolderId;
    if (sourceFolder === folderId) return;
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => (m.id === emailId && m.folderId === sourceFolder ? { ...m, folderId } : m)),
    }));
    void runRemoval({
      items: [{ folderId: sourceFolder, id: emailId }],
      rows: email ? [email] : [],
      target: folderId,
      send: (from, ids) => emailsApi.bulkMoveEmails(ids, folderId, from),
      failureTitle: 'Could not move',
    });
  },
  copyEmailToFolder: (emailId, folderId) => {
    const original = get().localEmails.find((m) => m.id === emailId);
    if (!original) return;
    const copied: MailMessageMetadata = {
      ...original,
      id: `msg-copy-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      folderId,
    };
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: [copied, ...s.localEmails],
    }));
    const gained = isServerMessageId(emailId) ? { total: 1, unread: original.isRead ? 0 : 1 } : null;
    if (gained) useFolderStore.getState().adjustCounts(folderId, gained);
    void emailsApi.copyEmail(emailId, folderId, original.folderId).then(async (result) => {
      if (result) {
        await invalidateFolderSync(folderId);
        await applyMutationResult(result);
        return;
      }
      if (gained) useFolderStore.getState().adjustCounts(folderId, { total: -gained.total, unread: -gained.unread });
      set((s) => ({ localEmails: s.localEmails.filter((m) => m.id !== copied.id) }));
      useToastStore.getState().addToast({
        title: 'Could not copy',
        description: 'The server did not accept the copy.',
        type: 'error',
      });
    });
  },
  categorizeEmail: (emailId, category) => {
    const email = get().localEmails.find((m) => m.id === emailId);
    const existing = email?.categoryKeywords || [];
    let addFlags: string[] | undefined;
    let removeFlags: string[] | undefined;

    if (!category) {
      removeFlags = existing.length > 0 ? existing : undefined;
    } else if (existing.includes(category)) {
      removeFlags = [category];
    } else {
      addFlags = [category];
    }

    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => {
        if (m.id !== emailId) return m;
        if (!category) return { ...m, categoryKeywords: [] };
        const ex = m.categoryKeywords || [];
        const next = ex.includes(category)
          ? ex.filter((c) => c !== category)
          : [...ex, category];
        return { ...m, categoryKeywords: next };
      }),
    }));

    if (addFlags || removeFlags) {
      settleFlags(emailsApi.handleCustomFlags([emailId], addFlags, removeFlags, email?.folderId || get().selectedFolderId));
    }
  },
  snoozeEmail: (id, _until) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.filter((m) => m.id !== id),
    selectedMailId: s.selectedMailId === id ? null : s.selectedMailId,
  })),
  bulkDelete: () => {
    const ids = get().selectedIds;
    if (ids.length === 0) return;
    const fallbackFolder = get().selectedFolderId;
    const removed = get().localEmails.filter((m) => ids.includes(m.id));
    const folderOf = new Map(removed.map((m) => [m.id, m.folderId]));
    set((s) => {
      const setIds = new Set(s.selectedIds);
      return {
        lastSnapshot: s.localEmails,
        localEmails: s.localEmails.filter((m) => !setIds.has(m.id)),
        selectedIds: [],
        selectedMailId: null,
      };
    });
    void runRemoval({
      items: ids.map((id) => ({ folderId: folderOf.get(id) || fallbackFolder, id })),
      rows: removed,
      send: (from, group) => emailsApi.bulkDeleteEmails(group, from),
      failureTitle: 'Could not delete',
    });
  },
  bulkMarkAsRead: (isRead) => {
    const ids = get().selectedIds;
    if (ids.length === 0) return;
    const folder = get().selectedFolderId;
    const changing = get().localEmails.filter((m) => ids.includes(m.id) && m.isRead !== isRead);
    set((s) => {
      const setIds = new Set(s.selectedIds);
      return {
        lastSnapshot: s.localEmails,
        localEmails: s.localEmails.map((m) => (setIds.has(m.id) ? { ...m, isRead } : m)),
      };
    });
    settleFlags(emailsApi.bulkMarkAsRead(ids, isRead, folder));
    for (const [folderId, rows] of groupByFolder(changing)) {
      useFolderStore.getState().bumpUnread(folderId, isRead ? -rows.length : rows.length);
    }
  },
  bulkMoveToFolder: (folderId) => {
    const ids = get().selectedIds;
    if (ids.length === 0) return;
    const fallbackFolder = get().selectedFolderId;
    const selected = get().localEmails.filter((m) => ids.includes(m.id));
    const moving = selected.filter((m) => m.folderId !== folderId);
    const movingIds = new Set(moving.map((m) => m.id));
    const alreadyThere = new Set(selected.filter((m) => m.folderId === folderId).map((m) => m.id));
    const folderOf = new Map(moving.map((m) => [m.id, m.folderId]));
    const items = ids
      .filter((id) => !alreadyThere.has(id))
      .map((id) => ({ folderId: folderOf.get(id) || fallbackFolder, id }));
    if (items.length === 0) {
      set({ selectedIds: [] });
      return;
    }
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => (movingIds.has(m.id) && m.folderId !== folderId ? { ...m, folderId } : m)),
      selectedIds: [],
      selectedMailId: null,
    }));
    void runRemoval({
      items,
      rows: moving,
      target: folderId,
      send: (from, group) => emailsApi.bulkMoveEmails(group, folderId, from),
      failureTitle: 'Could not move',
    });
  },
  bulkToggleFlag: (isFlagged) => {
    const ids = get().selectedIds;
    if (ids.length === 0) return;
    const targetFlag = isFlagged !== undefined ? isFlagged : true;
    set((s) => {
      const setIds = new Set(s.selectedIds);
      return {
        lastSnapshot: s.localEmails,
        localEmails: s.localEmails.map((m) =>
          setIds.has(m.id) ? { ...m, isFlagged: isFlagged !== undefined ? isFlagged : !m.isFlagged } : m
        ),
      };
    });
    settleFlags(emailsApi.bulkToggleFlag(ids, targetFlag, get().selectedFolderId));
  },
  undoLastAction: () => {
    const snap = get().lastSnapshot;
    if (!snap) return false;
    set({ localEmails: snap, lastSnapshot: null });
    return true;
  },
}));

interface MessageRef {
  folderId: string;
  id: string;
}

interface RemovalOptions {
  items: MessageRef[];
  rows: MailMessageMetadata[];
  target?: string;
  send: (folderId: string, ids: string[]) => Promise<MutationResult | null>;
  failureTitle: string;
}

interface RemovalOutcome {
  folderId: string;
  ids: string[];
  result: MutationResult | null;
}

const EMPTY_RESULT: MutationResult = { folders: [], quota: null };

function groupByFolder(rows: MailMessageMetadata[]): Map<string, MailMessageMetadata[]> {
  const groups = new Map<string, MailMessageMetadata[]>();
  for (const row of rows) {
    const list = groups.get(row.folderId);
    if (list) list.push(row);
    else groups.set(row.folderId, [row]);
  }
  return groups;
}

function groupIds(items: MessageRef[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const { folderId, id } of items) {
    const ids = groups.get(folderId);
    if (ids) ids.push(id);
    else groups.set(folderId, [id]);
  }
  return groups;
}

async function applyMutationResult(result: MutationResult | null): Promise<void> {
  if (!result) return;
  await useFolderStore.getState().applyServerCounts(result.folders, useMailStore.getState().selectedFolderId);
  setInboxQuota(result.quota);
}

function settleFlags(request: Promise<MutationResult | null>): void {
  request.then(applyMutationResult).catch(() => undefined);
}

function shiftCounts(
  rows: MailMessageMetadata[],
  folderId: string,
  ids: string[],
  target: string | undefined,
  direction: 1 | -1
): void {
  const onServer = new Set(ids.filter(isServerMessageId));
  if (onServer.size === 0) return;
  const unread = rows.filter((m) => m.folderId === folderId && onServer.has(m.id) && !m.isRead).length;
  const folders = useFolderStore.getState();
  folders.adjustCounts(folderId, { total: -onServer.size * direction, unread: -unread * direction });
  if (target) folders.adjustCounts(target, { total: onServer.size * direction, unread: unread * direction });
}

function restoreRefused(
  refused: RemovalOutcome[],
  rows: MailMessageMetadata[],
  target: string | undefined,
  failureTitle: string
): void {
  const refusedKeys = new Set(refused.flatMap(({ folderId, ids }) => ids.map((id) => messageKey(folderId, id))));
  const original = rows.filter((m) => refusedKeys.has(messageKey(m.folderId, m.id)));
  const originalById = new Map(original.map((m) => [m.id, m]));

  quietly(() =>
    useMailStore.setState((state) => {
      if (target) {
        return {
          localEmails: state.localEmails.map((m) =>
            m.folderId === target ? (originalById.get(m.id) ?? m) : m
          ),
        };
      }
      const present = new Set(state.localEmails.map((m) => messageKey(m.folderId, m.id)));
      const missing = original.filter((m) => !present.has(messageKey(m.folderId, m.id)));
      return { localEmails: [...state.localEmails, ...missing].sort(newestFirst) };
    })
  );

  for (const { folderId, ids } of refused) shiftCounts(rows, folderId, ids, target, -1);

  const count = refusedKeys.size;
  useToastStore.getState().addToast({
    title: failureTitle,
    description:
      count === 1
        ? 'The server did not accept the change, so the message was put back.'
        : `The server did not accept the change, so ${count} messages were put back.`,
    type: 'error',
  });
}

async function runRemoval({ items, rows, target, send, failureTitle }: RemovalOptions): Promise<void> {
  const groups = groupIds(items);
  for (const [folderId, ids] of groups) {
    holdRemoval(folderId, ids);
    shiftCounts(rows, folderId, ids, target, 1);
  }

  const outcomes: RemovalOutcome[] = await Promise.all(
    [...groups].map(async ([folderId, ids]) => {
      const onServer = ids.filter(isServerMessageId);
      const result = onServer.length === 0 ? EMPTY_RESULT : await send(folderId, onServer);
      return { folderId, ids, result };
    })
  );
  const accepted = outcomes.filter((o) => o.result !== null);
  const refused = outcomes.filter((o) => o.result === null);

  for (const { folderId, ids, result } of outcomes) settleRemoval(folderId, ids, result !== null);

  await Promise.all(
    accepted.flatMap(({ folderId, ids }) => [
      deleteCachedEmails(folderId, ids),
      shiftFolderSyncTotal(folderId, -ids.filter(isServerMessageId).length),
    ])
  );
  if (target && accepted.length > 0) await invalidateFolderSync(target);
  for (const { result } of accepted) await applyMutationResult(result);

  if (refused.length > 0) restoreRefused(refused, rows, target, failureTitle);
}

useMailStore.subscribe((state, previous) => {
  if (suppressPersist || state.localEmails === previous.localEmails) return;
  const before = new Map(previous.localEmails.map((m) => [messageKey(m.folderId, m.id), m]));
  const edited = state.localEmails.filter((m) => {
    const old = before.get(messageKey(m.folderId, m.id));
    return old !== undefined && old !== m;
  });
  if (edited.length > 0) void saveCachedEmails(edited);
});

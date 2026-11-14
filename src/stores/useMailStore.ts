import { create } from 'zustand';
import { MailMessageMetadata } from '@/types';
import { emailsApi, foldersApi } from '@/lib/api';
import {
  saveCachedEmails,
  deleteCachedEmails,
  patchCachedEmail,
  invalidateFolderSync,
  clearFolderCache,
} from '@/lib/idb/mailCacheDb';
import { loadFolderEmails, loadMoreFolderEmails, refreshFolderEmails } from '@/lib/mailSync';
import { getOpenMailSession } from '@/lib/storage/mailSessionStorage';
import { getRegisteredFolder } from '@/lib/folders';
import { useGeneralSettingsStore } from './useGeneralSettingsStore';
import { useFolderStore } from './useFolderStore';

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

  /**
   * Show a folder's messages. After the first fetch they come from the local
   * copy with no request; `force` asks the backend again (manual sync).
   */
  fetchEmails: (folderId?: string, accountId?: string, options?: { force?: boolean }) => Promise<void>;
  /** Live update after a server event: merge the folder's newest page from the backend. */
  refreshFolder: (folderId: string) => Promise<void>;
  /** A server event changed a message's flags (read / flagged). */
  applyMessageFlags: (folderId: string, emailId: string, patch: Partial<MailMessageMetadata>) => void;
  /** A server event removed a message. */
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
  emptyFolder: (folderId: string) => void;
  deleteEmail: (id: string) => void;
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
  // A folder id from the backend; validated against the folder list once it loads.
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
    // Resolved from the signed-in session once it loads (see MailClientView).
    selectedAccountId: '',
    selectedAccountIndex: 0,
    selectedFolderId: initialFolder,
    selectedMailId: initialMailId,
    localEmails: [] as MailMessageMetadata[],
    isLoadingEmails: false,
  };
}

const initialState = getInitialState();

// Identifies the newest list request so a slow, superseded response cannot overwrite a newer list.
let latestFetchId = 0;

// While true, changes to `localEmails` are not written back to IndexedDB: they
// come from IndexedDB or the backend and are already stored.
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
    // Folder ids come from the backend; nothing to load until its folder list has arrived.
    if (!fId || !folder) return;

    const requestId = ++latestFetchId;
    set({ isLoadingEmails: true });
    try {
      // From the local copy when this folder was fetched before; the backend is asked the first time or when forced.
      const result = await loadFolderEmails(folder, aId || undefined, { force: options?.force });
      // A newer request (e.g. the user switched folder) owns the list and the loading flag now.
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
      // The user moved to another folder/account while this page loaded: drop it.
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

  refreshFolder: async (folderId) => {
    const folder = getRegisteredFolder(folderId);
    if (!folder) return;
    try {
      const result = await refreshFolderEmails(folder, folder.accountId || undefined);
      if (get().selectedFolderId === folderId) {
        quietly(() =>
          set({ localEmails: result.emails, emailPage: result.pagesLoaded, hasMoreEmails: result.hasMore })
        );
      }
    } catch {
      // Keep showing what we have; the next event or manual sync retries.
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
    // First resolution from the session: keep the restored folder/mail selection.
    if (!s.selectedAccountId) return { selectedAccountId: id };
    // Mail lists are per-mailbox; clear the previous account's list until the new one loads.
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
      emailsApi.markAsRead(id, true, current.folderId || get().selectedFolderId).catch(() => {});
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
    emailsApi.toggleFlag(id, newFlag, email?.folderId || get().selectedFolderId).catch(() => {});
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
    emailsApi.markAsRead(id, nextRead, folder).catch(() => {});
    if (email && email.isRead !== nextRead) {
      useFolderStore.getState().bumpUnread(email.folderId, nextRead ? -1 : 1);
    }
  },
  markFolderAsRead: (folderId) => {
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => (m.folderId === folderId ? { ...m, isRead: true } : m)),
    }));
    // Every message in the folder, not just the ones loaded on screen.
    emailsApi.markAllAsRead(folderId).catch(() => {});
    useFolderStore.getState().clearUnread(folderId);
  },
  emptyFolder: (folderId) => {
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.filter((m) => m.folderId !== folderId),
      selectedMailId: null,
      selectedIds: [],
    }));
    foldersApi.emptyFolder(folderId).catch(() => {});
    void clearFolderCache(folderId);
    useFolderStore.getState().clearUnread(folderId);
  },
  deleteEmail: (id) => {
    const email = get().localEmails.find((m) => m.id === id);
    const folder = email?.folderId || get().selectedFolderId;
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
    emailsApi.deleteEmail(id, folder).catch(() => {});
    void deleteCachedEmails(folder, [id]);
    if (email && !email.isRead) useFolderStore.getState().bumpUnread(email.folderId, -1);
  },
  moveEmailToFolder: (emailId, folderId) => {
    const email = get().localEmails.find((m) => m.id === emailId);
    const sourceFolder = email?.folderId || get().selectedFolderId;
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => (m.id === emailId ? { ...m, folderId } : m)),
    }));
    emailsApi.moveEmail(emailId, folderId, sourceFolder).catch(() => {});
    // The server gives the message a new uid in the target folder: forget it here, and have the target fetch again when opened.
    void deleteCachedEmails(sourceFolder, [emailId]);
    void invalidateFolderSync(folderId);
    if (email && !email.isRead) {
      useFolderStore.getState().bumpUnread(sourceFolder, -1);
      useFolderStore.getState().bumpUnread(folderId, 1);
    }
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
    emailsApi.copyEmail(emailId, folderId, original.folderId).catch(() => {});
    // The copy only exists on the server (with its own uid): have the target fetch again when opened.
    void invalidateFolderSync(folderId);
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
      emailsApi.handleCustomFlags([emailId], addFlags, removeFlags).catch(() => {});
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
    const folder = get().selectedFolderId;
    const removed = get().localEmails.filter((m) => ids.includes(m.id));
    set((s) => {
      const setIds = new Set(s.selectedIds);
      return {
        lastSnapshot: s.localEmails,
        localEmails: s.localEmails.filter((m) => !setIds.has(m.id)),
        selectedIds: [],
        selectedMailId: null,
      };
    });
    emailsApi.bulkDeleteEmails(ids, folder).catch(() => {});
    for (const [folderId, rows] of groupByFolder(removed)) {
      void deleteCachedEmails(folderId, rows.map((m) => m.id));
      const unread = rows.filter((m) => !m.isRead).length;
      if (unread) useFolderStore.getState().bumpUnread(folderId, -unread);
    }
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
    emailsApi.bulkMarkAsRead(ids, isRead, folder).catch(() => {});
    for (const [folderId, rows] of groupByFolder(changing)) {
      useFolderStore.getState().bumpUnread(folderId, isRead ? -rows.length : rows.length);
    }
  },
  bulkMoveToFolder: (folderId) => {
    const ids = get().selectedIds;
    if (ids.length === 0) return;
    const currentFolder = get().selectedFolderId;
    const moving = get().localEmails.filter((m) => ids.includes(m.id));
    set((s) => {
      const setIds = new Set(s.selectedIds);
      return {
        lastSnapshot: s.localEmails,
        localEmails: s.localEmails.map((m) => (setIds.has(m.id) ? { ...m, folderId } : m)),
        selectedIds: [],
        selectedMailId: null,
      };
    });
    emailsApi.bulkMoveEmails(ids, folderId, currentFolder).catch(() => {});
    // The server gives moved messages new uids in the target folder: forget them here, and have the target fetch again when opened.
    for (const [sourceFolder, rows] of groupByFolder(moving)) {
      void deleteCachedEmails(sourceFolder, rows.map((m) => m.id));
      const unread = rows.filter((m) => !m.isRead).length;
      if (unread) {
        useFolderStore.getState().bumpUnread(sourceFolder, -unread);
        useFolderStore.getState().bumpUnread(folderId, unread);
      }
    }
    void invalidateFolderSync(folderId);
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
    // One request for the whole selection.
    emailsApi.bulkToggleFlag(ids, targetFlag, get().selectedFolderId).catch(() => {});
  },
  undoLastAction: () => {
    const snap = get().lastSnapshot;
    if (!snap) return false;
    set({ localEmails: snap, lastSnapshot: null });
    return true;
  },
}));

function groupByFolder(rows: MailMessageMetadata[]): Map<string, MailMessageMetadata[]> {
  const groups = new Map<string, MailMessageMetadata[]>();
  for (const row of rows) {
    const list = groups.get(row.folderId);
    if (list) list.push(row);
    else groups.set(row.folderId, [row]);
  }
  return groups;
}

// Keep the local copy in step with what the user changes on screen: a message
// edited in place (read, flagged, pinned, categorized) is written back to
// IndexedDB, so reopening the folder shows it as it was left. Added, moved and
// removed messages are handled by the actions above, not here.
useMailStore.subscribe((state, previous) => {
  if (suppressPersist || state.localEmails === previous.localEmails) return;
  const before = new Map(previous.localEmails.map((m) => [`${m.folderId}|${m.id}`, m]));
  const edited = state.localEmails.filter((m) => {
    const old = before.get(`${m.folderId}|${m.id}`);
    return old !== undefined && old !== m;
  });
  if (edited.length > 0) void saveCachedEmails(edited);
});

import { create } from 'zustand';
import { MailMessageMetadata } from '@/types';
import { emailsApi, foldersApi } from '@/lib/api';
import { MOCK_EMAILS_METADATA } from '@/lib/mock';
import { getCachedEmails, saveCachedEmails } from '@/lib/idb/mailCacheDb';
import { getOpenMailSession } from '@/lib/storage/mailSessionStorage';
import { useGeneralSettingsStore } from './useGeneralSettingsStore';

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

  fetchEmails: (folderId?: string, accountId?: string) => Promise<void>;
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
  const defaultAccId = 'acc-1';
  let initialFolder = 'fld-inbox';
  let initialMailId: string | null = 'msg-candidate-outreach';

  if (typeof window !== 'undefined') {
    const saved = getOpenMailSession(0);
    if (saved) {
      if (saved.folderId) initialFolder = saved.folderId;
      if (saved.mailId) initialMailId = saved.mailId;
    }
  }

  const initialList = MOCK_EMAILS_METADATA.filter((e) => e.accountId === defaultAccId);
  initialList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const initialSlice = initialList.slice(0, 25);
  if (!initialMailId && initialSlice.length > 0) {
    initialMailId = initialSlice[0].id;
  }

  return {
    selectedAccountId: defaultAccId,
    selectedAccountIndex: 0,
    selectedFolderId: initialFolder,
    selectedMailId: initialMailId,
    localEmails: initialSlice,
    isLoadingEmails: false,
  };
}

const initialState = getInitialState();

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

  fetchEmails: async (folderId, accountId) => {
    const fId = folderId || get().selectedFolderId || 'fld-inbox';
    const aId = accountId || get().selectedAccountId || 'acc-1';
    set({ isLoadingEmails: true, emailPage: 1 });
    try {
      const cached = await getCachedEmails(fId, aId);
      if (cached.length > 0 && get().localEmails.length === 0) {
        set({ localEmails: cached, selectedFolderId: fId });
      }
    } catch {}
    try {
      const list = await emailsApi.getEmailsMetadata(fId, aId, 1, 25);
      set({
        localEmails: list,
        emailPage: 1,
        hasMoreEmails: list.length >= 25,
        isLoadingEmails: false,
      });
      saveCachedEmails(list);
    } catch {
      set({ isLoadingEmails: false });
    }
  },

  loadMoreEmails: async () => {
    if (get().isLoadingMore || !get().hasMoreEmails) return;
    const nextPage = get().emailPage + 1;
    const fId = get().selectedFolderId || 'fld-inbox';
    const aId = get().selectedAccountId || 'acc-1';
    set({ isLoadingMore: true });
    try {
      const nextBatch = await emailsApi.getEmailsMetadata(fId, aId, nextPage, 25);
      const current = get().localEmails;
      const currentIds = new Set(current.map((e) => e.id));
      const fresh = nextBatch.filter((e) => !currentIds.has(e.id));
      const merged = [...current, ...fresh];
      set({
        localEmails: merged,
        emailPage: nextPage,
        hasMoreEmails: nextBatch.length >= 25,
        isLoadingMore: false,
      });
      saveCachedEmails(fresh);
    } catch {
      set({ isLoadingMore: false });
    }
  },

  setLocalEmails: (localEmails) => set({ localEmails }),
  addOrSelectEmail: (email) => set((s) => ({
    localEmails: s.localEmails.some((e) => e.id === email.id) ? s.localEmails : [email, ...s.localEmails],
    selectedMailId: email.id,
  })),
  setSelectedAccount: (id) => set((s) => {
    if (s.selectedAccountId === id) return s;
    const accountEmails = MOCK_EMAILS_METADATA.filter((e) => e.accountId === id);
    accountEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const initialSlice = accountEmails.slice(0, 25);
    return {
      selectedAccountId: id,
      localEmails: initialSlice,
      emailPage: 1,
      hasMoreEmails: accountEmails.length >= 25,
      selectedMailId: initialSlice[0]?.id || null,
      selectedFolderId: 'fld-inbox',
      selectedIds: [],
    };
  }),
  setSelectedAccountIndex: (index) => set({ selectedAccountIndex: index }),
  setSelectedFolder: (id) => set((s) => {
    if (s.selectedFolderId === id) return s;
    const inFolder = s.localEmails.some(
      (e) => (id === 'fld-inbox' ? (!e.folderId || e.folderId === 'fld-inbox') : e.folderId === id) && e.id === s.selectedMailId
    );
    const folderEmails = s.localEmails.filter((e) =>
      id === 'fld-inbox' ? (!e.folderId || e.folderId === 'fld-inbox') : e.folderId === id
    );
    return {
      selectedFolderId: id,
      selectedMailId: inFolder ? s.selectedMailId : (folderEmails[0]?.id || null),
      selectedIds: [],
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
    emailsApi.toggleFlag(id, newFlag).catch(() => {});
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
  },
  markFolderAsRead: (folderId) => {
    const folderEmails = get().localEmails.filter((m) =>
      m.folderId === folderId || (folderId === 'fld-inbox' && (!m.folderId || m.folderId === 'fld-inbox'))
    );
    const unreadIds = folderEmails.filter((m) => !m.isRead).map((m) => m.id);
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) =>
        m.folderId === folderId || (folderId === 'fld-inbox' && (!m.folderId || m.folderId === 'fld-inbox')) ? { ...m, isRead: true } : m
      ),
    }));
    if (unreadIds.length > 0) {
      emailsApi.bulkMarkAsRead(unreadIds, true, folderId).catch(() => {});
    }
  },
  emptyFolder: (folderId) => {
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.filter((m) => folderId === 'fld-inbox' ? m.folderId && m.folderId !== 'fld-inbox' : m.folderId !== folderId),
      selectedMailId: null,
      selectedIds: [],
    }));
    foldersApi.emptyFolder(folderId).catch(() => {});
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
  },
  moveEmailToFolder: (emailId, folderId) => {
    const currentFolder = get().selectedFolderId;
    set((s) => ({
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) => (m.id === emailId ? { ...m, folderId } : m)),
    }));
    emailsApi.moveEmail(emailId, folderId, currentFolder).catch(() => {});
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
  },
  bulkMarkAsRead: (isRead) => {
    const ids = get().selectedIds;
    if (ids.length === 0) return;
    const folder = get().selectedFolderId;
    set((s) => {
      const setIds = new Set(s.selectedIds);
      return {
        lastSnapshot: s.localEmails,
        localEmails: s.localEmails.map((m) => (setIds.has(m.id) ? { ...m, isRead } : m)),
      };
    });
    emailsApi.bulkMarkAsRead(ids, isRead, folder).catch(() => {});
  },
  bulkMoveToFolder: (folderId) => {
    const ids = get().selectedIds;
    if (ids.length === 0) return;
    const currentFolder = get().selectedFolderId;
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
    for (const id of ids) {
      emailsApi.toggleFlag(id, targetFlag).catch(() => {});
    }
  },
  undoLastAction: () => {
    const snap = get().lastSnapshot;
    if (!snap) return false;
    set({ localEmails: snap, lastSnapshot: null });
    return true;
  },
}));

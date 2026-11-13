import { create } from 'zustand';
import { MailMessageMetadata } from '@/types';
import { emailsApi, foldersApi } from '@/lib/api';
import { MOCK_EMAILS_METADATA } from '@/lib/mock';
import { getCachedEmails, saveCachedEmails } from '@/lib/idb/mailCacheDb';
import { getOpenMailSession } from '@/lib/storage/mailSessionStorage';

export type MailFilterTab = 'all' | 'unread' | 'flagged' | 'attachments' | 'pinned';

interface MailState {
  selectedAccountId: string;
  selectedAccountIndex: number;
  selectedFolderId: string;
  selectedMailId: string | null;
  filterTab: MailFilterTab;
  searchQuery: string;
  selectedIds: string[];
  localEmails: MailMessageMetadata[];
  isLoadingEmails: boolean;
  lastSnapshot: MailMessageMetadata[] | null;

  fetchEmails: (folderId?: string, accountId?: string) => Promise<void>;
  setLocalEmails: (emails: MailMessageMetadata[]) => void;
  addOrSelectEmail: (email: MailMessageMetadata) => void;
  setSelectedAccount: (id: string) => void;
  setSelectedAccountIndex: (index: number) => void;
  setSelectedFolder: (id: string) => void;
  setSelectedMail: (id: string | null) => void;
  setFilterTab: (tab: MailFilterTab) => void;
  setSearchQuery: (query: string) => void;
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
  if (!initialMailId && initialList.length > 0) {
    initialMailId = initialList[0].id;
  }

  return {
    selectedAccountId: defaultAccId,
    selectedAccountIndex: 0,
    selectedFolderId: initialFolder,
    selectedMailId: initialMailId,
    localEmails: initialList,
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
  searchQuery: '',
  selectedIds: [],
  localEmails: initialState.localEmails,
  isLoadingEmails: false,
  lastSnapshot: null,

  fetchEmails: async (folderId, accountId) => {
    const fId = folderId || get().selectedFolderId || 'fld-inbox';
    const aId = accountId || get().selectedAccountId || 'acc-1';
    try {
      const cached = await getCachedEmails(fId, aId);
      if (cached.length > 0 && get().localEmails.length === 0) {
        set({ localEmails: cached, selectedFolderId: fId });
      }
    } catch {}
    try {
      const list = await emailsApi.getEmailsMetadata(fId, aId);
      set({ localEmails: list, isLoadingEmails: false });
      saveCachedEmails(list);
    } catch {
      set({ isLoadingEmails: false });
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
    return {
      selectedAccountId: id,
      localEmails: accountEmails,
      selectedMailId: accountEmails[0]?.id || null,
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
  setSearchQuery: (searchQuery) => set({ searchQuery }),

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
      const nextEmails = s.localEmails.filter((m) => m.id !== id);
      return {
        lastSnapshot: s.localEmails,
        localEmails: nextEmails,
        selectedMailId: s.selectedMailId === id ? nextEmails[0]?.id || null : s.selectedMailId,
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

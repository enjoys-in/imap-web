import { create } from 'zustand';
import { MailMessageMetadata } from '@/types';
import { emailsApi } from '@/api';
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
  setSelectedMail: (id) => set((s) => {
    if (s.selectedMailId === id && (!id || s.localEmails.some((m) => m.id === id && m.isRead))) {
      return s;
    }
    return {
      selectedMailId: id,
      localEmails: id ? s.localEmails.map((m) => (m.id === id ? { ...m, isRead: true } : m)) : s.localEmails,
    };
  }),
  setFilterTab: (filterTab) => set({ filterTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleSelectId: (id) => set((s) => ({
    selectedIds: s.selectedIds.includes(id) ? s.selectedIds.filter((item) => item !== id) : [...s.selectedIds, id],
  })),
  selectAllIds: (ids) => set({ selectedIds: ids }),
  clearSelectedIds: () => set({ selectedIds: [] }),

  toggleFlag: (id) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.map((m) => (m.id === id ? { ...m, isFlagged: !m.isFlagged } : m)),
  })),
  togglePin: (id) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.map((m) => (m.id === id ? { ...m, isPinned: !m.isPinned } : m)),
  })),
  markAsRead: (id, isRead) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.map((m) => (m.id === id ? { ...m, isRead: isRead !== undefined ? isRead : !m.isRead } : m)),
  })),
  markFolderAsRead: (folderId) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.map((m) =>
      m.folderId === folderId || (folderId === 'fld-inbox' && (!m.folderId || m.folderId === 'fld-inbox')) ? { ...m, isRead: true } : m
    ),
  })),
  emptyFolder: (folderId) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.filter((m) => folderId === 'fld-inbox' ? m.folderId && m.folderId !== 'fld-inbox' : m.folderId !== folderId),
    selectedMailId: null,
    selectedIds: [],
  })),
  deleteEmail: (id) => set((s) => {
    const nextEmails = s.localEmails.filter((m) => m.id !== id);
    return { lastSnapshot: s.localEmails, localEmails: nextEmails, selectedMailId: s.selectedMailId === id ? nextEmails[0]?.id || null : s.selectedMailId };
  }),
  moveEmailToFolder: (emailId, folderId) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.map((m) => (m.id === emailId ? { ...m, folderId } : m)),
  })),
  snoozeEmail: (id, _until) => set((s) => ({
    lastSnapshot: s.localEmails,
    localEmails: s.localEmails.filter((m) => m.id !== id),
    selectedMailId: s.selectedMailId === id ? null : s.selectedMailId,
  })),
  bulkDelete: () => set((s) => {
    const setIds = new Set(s.selectedIds);
    return { lastSnapshot: s.localEmails, localEmails: s.localEmails.filter((m) => !setIds.has(m.id)), selectedIds: [], selectedMailId: null };
  }),
  bulkMarkAsRead: (isRead) => set((s) => {
    const setIds = new Set(s.selectedIds);
    return { lastSnapshot: s.localEmails, localEmails: s.localEmails.map((m) => (setIds.has(m.id) ? { ...m, isRead } : m)) };
  }),
  bulkMoveToFolder: (folderId) => set((s) => {
    const setIds = new Set(s.selectedIds);
    return { lastSnapshot: s.localEmails, localEmails: s.localEmails.map((m) => (setIds.has(m.id) ? { ...m, folderId } : m)), selectedIds: [], selectedMailId: null };
  }),
  bulkToggleFlag: (isFlagged) => set((s) => {
    const setIds = new Set(s.selectedIds);
    return {
      lastSnapshot: s.localEmails,
      localEmails: s.localEmails.map((m) =>
        setIds.has(m.id) ? { ...m, isFlagged: isFlagged !== undefined ? isFlagged : !m.isFlagged } : m
      ),
    };
  }),
  undoLastAction: () => {
    const snap = get().lastSnapshot;
    if (!snap) return false;
    set({ localEmails: snap, lastSnapshot: null });
    return true;
  },
}));

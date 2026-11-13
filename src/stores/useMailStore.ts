import { create } from 'zustand';
import { MailMessageMetadata } from '@/types';
import { emailsApi } from '@/api';

export type MailFilterTab = 'all' | 'unread' | 'flagged';

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
  bulkDelete: () => void;
  bulkMarkAsRead: (isRead: boolean) => void;
  bulkMoveToFolder: (folderId: string) => void;
  bulkToggleFlag: (isFlagged?: boolean) => void;
  undoLastAction: () => boolean;
}

export const useMailStore = create<MailState>((set, get) => ({
  selectedAccountId: 'acc-1',
  selectedAccountIndex: 0,
  selectedFolderId: 'fld-inbox',
  selectedMailId: 'msg-whitekraaft',
  filterTab: 'all',
  searchQuery: '',
  selectedIds: [],
  localEmails: [],
  isLoadingEmails: false,
  lastSnapshot: null,

  fetchEmails: async (folderId, accountId) => {
    const fId = folderId || get().selectedFolderId || 'fld-inbox';
    const aId = accountId || get().selectedAccountId || 'acc-1';
    if (get().selectedFolderId === fId && get().selectedAccountId === aId && get().localEmails.length > 0 && !get().isLoadingEmails) return;
    set({ isLoadingEmails: true, selectedFolderId: fId });
    try {
      const list = await emailsApi.getEmailsMetadata(fId, aId);
      set({ localEmails: list, isLoadingEmails: false });
    } catch {
      set({ isLoadingEmails: false });
    }
  },

  setLocalEmails: (localEmails) => set({ localEmails }),
  addOrSelectEmail: (email) => set((s) => ({
    localEmails: s.localEmails.some((e) => e.id === email.id) ? s.localEmails : [email, ...s.localEmails],
    selectedMailId: email.id,
  })),
  setSelectedAccount: (id) => set({ selectedAccountId: id, selectedMailId: null }),
  setSelectedAccountIndex: (index) => set({ selectedAccountIndex: index }),
  setSelectedFolder: (id) => set({ selectedFolderId: id, selectedMailId: null, selectedIds: [] }),
  setSelectedMail: (id) => set((s) => ({
    selectedMailId: id,
    localEmails: id ? s.localEmails.map((m) => (m.id === id ? { ...m, isRead: true } : m)) : s.localEmails,
  })),
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

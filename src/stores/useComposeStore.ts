import { create } from 'zustand';
import { ComposeMode, ComposeSeed, buildComposeSeed } from '@/lib/replyBuilder';
import { MailMessage, MailMessageMetadata } from '@/types';

export type DraftSyncStatus = 'idle' | 'countdown' | 'saving' | 'saved';

export interface ComposeState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  mode: ComposeMode;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  originalMessageId?: string;
  threadId?: string;
  attachments: File[];
  draftId?: string;
  draftStatus: DraftSyncStatus;
  draftCountdown: number;
  lastSavedTime?: string;
  isAttaching: boolean;
  openNew: () => void;
  openReply: (msg: MailMessageMetadata | MailMessage, replyAll?: boolean) => void;
  openForward: (msg: MailMessageMetadata | MailMessage) => void;
  close: () => void;
  toggleMinimize: () => void;
  toggleMaximize: () => void;
  updateFields: (fields: Partial<ComposeState>) => void;
  addAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;
}

export const useComposeStore = create<ComposeState>((set) => ({
  isOpen: false,
  isMinimized: false,
  isMaximized: false,
  mode: 'new',
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
  attachments: [],
  draftId: undefined,
  draftStatus: 'idle',
  draftCountdown: 3,
  lastSavedTime: undefined,
  isAttaching: false,

  openNew: () =>
    set({
      isOpen: true,
      isMinimized: false,
      mode: 'new',
      to: '',
      cc: '',
      bcc: 'Jeelan Basha Shaik <jeelan.shaik@recruitment.com>',
      subject: '',
      body: '',
      originalMessageId: undefined,
      threadId: undefined,
      attachments: [],
      draftId: undefined,
      draftStatus: 'idle',
      draftCountdown: 3,
      lastSavedTime: undefined,
      isAttaching: false,
    }),

  openReply: (msg, replyAll = false) => {
    const seed = buildComposeSeed(replyAll ? 'replyAll' : 'reply', msg);
    const resolvedThreadId = msg.threadId || `thread-${msg.id}`;
    set({
      isOpen: true,
      isMinimized: false,
      mode: replyAll ? 'replyAll' : 'reply',
      to: seed.to,
      cc: seed.cc,
      subject: seed.subject,
      body: seed.body,
      originalMessageId: msg.id,
      threadId: resolvedThreadId,
      attachments: [],
      draftId: undefined,
      draftStatus: 'idle',
      draftCountdown: 3,
      lastSavedTime: undefined,
      isAttaching: false,
    });
  },

  openForward: (msg) => {
    const seed = buildComposeSeed('forward', msg);
    const resolvedThreadId = msg.threadId || `thread-${msg.id}`;
    set({
      isOpen: true,
      isMinimized: false,
      mode: 'forward',
      to: seed.to,
      cc: seed.cc,
      subject: seed.subject,
      body: seed.body,
      originalMessageId: msg.id,
      threadId: resolvedThreadId,
      attachments: [],
      draftId: undefined,
      draftStatus: 'idle',
      draftCountdown: 3,
      lastSavedTime: undefined,
      isAttaching: false,
    });
  },

  close: () =>
    set({
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      originalMessageId: undefined,
      threadId: undefined,
      draftId: undefined,
      draftStatus: 'idle',
      draftCountdown: 3,
      lastSavedTime: undefined,
      isAttaching: false,
    }),
  toggleMinimize: () => set((s) => ({ isMinimized: !s.isMinimized })),
  toggleMaximize: () => set((s) => ({ isMaximized: !s.isMaximized })),
  updateFields: (fields) => set((s) => ({ ...s, ...fields })),
  addAttachment: (file) => set((s) => ({ attachments: [...s.attachments, file] })),
  removeAttachment: (index) =>
    set((s) => ({ attachments: s.attachments.filter((_, i) => i !== index) })),
}));

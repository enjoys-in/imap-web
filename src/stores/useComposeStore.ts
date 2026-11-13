import { create } from 'zustand';
import { ComposeMode, ComposeSeed, buildComposeSeed } from '@/lib/replyBuilder';
import { MailMessage, MailMessageMetadata } from '@/types';

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
  openNew: () => void;
  openReply: (msg: MailMessageMetadata | MailMessage, replyAll?: boolean) => void;
  openForward: (msg: MailMessageMetadata | MailMessage) => void;
  close: () => void;
  toggleMinimize: () => void;
  toggleMaximize: () => void;
  updateFields: (fields: Partial<ComposeSeed>) => void;
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
    });
  },

  close: () => set({ isOpen: false, isMinimized: false, isMaximized: false, originalMessageId: undefined, threadId: undefined }),
  toggleMinimize: () => set((s) => ({ isMinimized: !s.isMinimized })),
  toggleMaximize: () => set((s) => ({ isMaximized: !s.isMaximized })),
  updateFields: (fields) => set((s) => ({ ...s, ...fields })),
  addAttachment: (file) => set((s) => ({ attachments: [...s.attachments, file] })),
  removeAttachment: (index) =>
    set((s) => ({ attachments: s.attachments.filter((_, i) => i !== index) })),
}));

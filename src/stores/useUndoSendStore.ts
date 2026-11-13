import { create } from 'zustand';
import { MailMessage } from '@/types';

export interface PendingSendEmail {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  message: MailMessage;
}

interface UndoSendState {
  pendingEmail: PendingSendEmail | null;
  secondsRemaining: number;
  timerId: NodeJS.Timeout | null;
  startPendingSend: (email: PendingSendEmail, onCommit: (msg: MailMessage) => void) => void;
  cancelSend: () => PendingSendEmail | null;
  commitNow: () => void;
}

export const useUndoSendStore = create<UndoSendState>((set, get) => ({
  pendingEmail: null,
  secondsRemaining: 5,
  timerId: null,

  startPendingSend: (email, onCommit) => {
    // Clear any active send
    const existing = get().timerId;
    if (existing) clearInterval(existing);

    let secs = 5;
    set({ pendingEmail: email, secondsRemaining: 5 });

    const interval = setInterval(() => {
      secs -= 1;
      if (secs <= 0) {
        clearInterval(interval);
        const current = get().pendingEmail;
        if (current) {
          onCommit(current.message);
        }
        set({ pendingEmail: null, timerId: null });
      } else {
        set({ secondsRemaining: secs });
      }
    }, 1000);

    set({ timerId: interval });
  },

  cancelSend: () => {
    const active = get().pendingEmail;
    const interval = get().timerId;
    if (interval) clearInterval(interval);
    set({ pendingEmail: null, timerId: null, secondsRemaining: 5 });
    return active;
  },

  commitNow: () => {
    const interval = get().timerId;
    if (interval) clearInterval(interval);
    set({ pendingEmail: null, timerId: null, secondsRemaining: 5 });
  },
}));

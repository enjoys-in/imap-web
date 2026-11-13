'use client';

import React from 'react';
import { Send, Undo2, X } from 'lucide-react';
import { useUndoSendStore } from '@/stores/useUndoSendStore';
import { useComposeStore } from '@/stores';
import { useToastStore } from '@/stores/useToastStore';

export function UndoSendToast() {
  const pendingEmail = useUndoSendStore((s) => s.pendingEmail);
  const secondsRemaining = useUndoSendStore((s) => s.secondsRemaining);
  const cancelSend = useUndoSendStore((s) => s.cancelSend);
  const commitNow = useUndoSendStore((s) => s.commitNow);
  const updateFields = useComposeStore((s) => s.updateFields);
  const addToast = useToastStore((s) => s.addToast);

  if (!pendingEmail) return null;

  const handleUndo = () => {
    const email = cancelSend();
    if (email) {
      useComposeStore.setState({
        isOpen: true,
        isMinimized: false,
        to: email.to,
        cc: email.cc || '',
        bcc: email.bcc || '',
        subject: email.subject,
        body: email.body,
      });
      addToast({
        title: 'Sending Undone',
        description: 'Draft reopened with all text and recipients restored.',
        type: 'info',
      });
    }
  };

  const progressPct = ((5 - secondsRemaining) / 5) * 100;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none animate-in slide-in-from-bottom-3 duration-150">
      <div className="bg-neutral-900/95 dark:bg-black/95 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-neutral-700/80 flex items-center gap-3 text-xs min-w-[300px]">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="flex-1 font-medium truncate">
          Sending &quot;{pendingEmail.subject || 'Message'}&quot; in {secondsRemaining}s...
        </span>
        <button
          type="button"
          onClick={handleUndo}
          className="px-2.5 py-1 rounded bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>
        <button
          type="button"
          onClick={commitNow}
          title="Send now without waiting"
          className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar under pill */}
      <div className="w-full px-2 mt-0.5">
        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden w-full">
          <div
            className="h-full bg-gradient-to-r from-[#0078d4] to-cyan-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

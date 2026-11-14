'use client';

import React, { useState } from 'react';
import { UserPlus, X, Check, Mail, Loader2 } from 'lucide-react';

interface CalendarInviteModalProps {
  open: boolean;
  onClose: () => void;
  onInviteSent: (email: string, role: string) => void;
}

export function CalendarInviteModal({
  open,
  onClose,
  onInviteSent,
}: CalendarInviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Teammate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!open) return null;

  const handleSend = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setIsSubmitting(true);
    try {
      await onInviteSent(email.trim(), role);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setEmail('');
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Share Calendar Availability
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Share free/busy status with a teammate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Input + Role Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Teammate Email Address
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Teammates will only see busy/free time blocks. Private and confidential meeting details remain concealed.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-8 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting || sentSuccess}
            className="px-4 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : sentSuccess ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : null}
            <span>{sentSuccess ? 'Shared!' : 'Share Availability'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

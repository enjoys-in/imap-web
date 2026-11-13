'use client';

import React, { useState } from 'react';
import { UserPlus, X, Copy, Check, Mail } from 'lucide-react';

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
  const [role, setRole] = useState('Editor');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!open) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://cansaas.studio/invite/ws-totoro-crm');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!email.trim() || !email.includes('@')) return;
    onInviteSent(email.trim(), role);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setEmail('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Invite to Workspace
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Share access to calendars, projects & tasks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Input + Role Dropdown */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborator@company.com"
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-9 px-3 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
          >
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Copy Shareable Link */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs">
          <span className="text-neutral-500 dark:text-neutral-400 truncate max-w-[240px]">
            https://cansaas.studio/invite/ws-totoro-crm
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 h-8 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sentSuccess}
            className="px-4 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:bg-emerald-600"
          >
            {sentSuccess ? 'Invite Sent!' : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

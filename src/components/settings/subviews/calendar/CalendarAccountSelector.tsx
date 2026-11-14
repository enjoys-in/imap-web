'use client';

import React from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Account } from '@/types';

interface CalendarAccountSelectorProps {
  accounts: Account[];
  selectedEmail: string;
  onSelectEmail: (email: string) => void;
  isConnected: boolean;
}

export function CalendarAccountSelector({
  accounts,
  selectedEmail,
  onSelectEmail,
  isConnected,
}: CalendarAccountSelectorProps) {
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-neutral-400" />
            <span>Select Account</span>
          </h3>
          <p className="text-neutral-500 text-xs mt-0.5">
            Select an email account to view and configure its associated calendar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Calendar Connected</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Not Connected</span>
            </span>
          )}
        </div>
      </div>

      <div className="max-w-md">
        <select
          value={selectedEmail}
          onChange={(e) => onSelectEmail(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 text-xs font-medium focus:outline-hidden focus:border-[#0078d4] cursor-pointer transition-colors"
        >
          {accounts.map((acc) => (
            <option key={acc.id || acc.email} value={acc.email}>
              {acc.email} {acc.displayName ? `(${acc.displayName})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

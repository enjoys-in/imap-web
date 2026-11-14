'use client';

import React from 'react';
import { Settings, Mail, Palette } from 'lucide-react';
import { useAccounts } from '@/hooks/useEmailsQuery';
import { useUiStore } from '@/stores';

export function SettingsView() {
  const { theme, toggleTheme } = useUiStore();
  const { data: accounts } = useAccounts();
  const currentAccount = accounts?.[0] || {
    displayName: '',
    email: '',
    imapHost: '',
    imapPort: 0,
    smtpHost: '',
    smtpPort: 0,
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <Settings className="w-6 h-6 text-[#0078d4]" />
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Settings & Preferences
            </h1>
            <p className="text-xs text-neutral-500">
              Manage email accounts, server connection, and display options.
            </p>
          </div>
        </div>

        {/* Account Details */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0078d4]" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Email Account Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-neutral-500 font-medium">Display Name</label>
              <div className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">
                {currentAccount.displayName}
              </div>
            </div>
            <div>
              <label className="text-neutral-500 font-medium">Email Address</label>
              <div className="mt-1 font-semibold text-neutral-800 dark:text-neutral-200">
                {currentAccount.email}
              </div>
            </div>
            <div>
              <label className="text-neutral-500 font-medium">IMAP Host & Port</label>
              <div className="mt-1 font-mono text-neutral-700 dark:text-neutral-300">
                {currentAccount.imapHost}:{currentAccount.imapPort}
              </div>
            </div>
            <div>
              <label className="text-neutral-500 font-medium">SMTP Host & Port</label>
              <div className="mt-1 font-mono text-neutral-700 dark:text-neutral-300">
                {currentAccount.smtpHost}:{currentAccount.smtpPort}
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Details */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#0078d4]" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Display & Theme
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">Dark Mode</p>
              <p className="text-neutral-500">Toggle high-contrast Outlook dark theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-md bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium transition-colors cursor-pointer"
            >
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

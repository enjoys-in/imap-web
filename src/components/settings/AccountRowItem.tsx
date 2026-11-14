'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Account } from '@/types';
import { AccountProviderIcon } from './AccountProviderIcon';

interface AccountRowItemProps {
  account: Account;
  onManage?: (account: Account) => void;
  onSignIn: (account: Account) => void;
}

export function AccountRowItem({ account, onSignIn }: AccountRowItemProps) {
  const isSignInRequired = account.requiresSignIn;

  return (
    <div className="py-3.5 px-3 rounded-lg hover:bg-neutral-100/70 dark:hover:bg-[#252525]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-[#2b2b2b] last:border-b-0">
      <div className="flex items-start gap-3 min-w-0">
        <AccountProviderIcon type={account.accountType} className="mt-0.5" />
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {account.email}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {account.accountType || 'IMAP'}
          </div>

          {isSignInRequired && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#d13438] dark:text-[#f46a6a] font-normal">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#d13438] dark:text-[#f46a6a]" />
              <span>Sign-in required. Click Sign in to resolve.</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {isSignInRequired && (
          <button
            type="button"
            onClick={() => onSignIn(account)}
            className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
          >
            Sign in
          </button>
        )}

        <Link
          href={`/settings/accounts/general?accountId=${account.id}`}
          className="h-8 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 dark:bg-[#2b2b2b] dark:hover:bg-[#383838] dark:text-neutral-100 dark:border-neutral-700/80 text-xs font-medium rounded transition-colors flex items-center justify-center cursor-pointer"
        >
          Manage
        </Link>
      </div>
    </div>
  );
}

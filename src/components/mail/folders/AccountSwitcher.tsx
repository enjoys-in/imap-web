'use client';

import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAccounts } from '@/hooks/useEmailsQuery';
import { useMailStore } from '@/stores';
import { cn } from '@/lib/utils';

export function AccountSwitcher() {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const setSelectedAccount = useMailStore((s) => s.setSelectedAccount);
  const { data: accounts } = useAccounts();

  const currentAccount =
    accounts?.find((a) => a.id === selectedAccountId) ||
    accounts?.[0] || { displayName: 'Mulayam', email: 'mullayam06@outlook.com' };

  return (
    <div className="relative select-none">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors text-left"
      >
        <div className="truncate">
          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {currentAccount.displayName}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {currentAccount.email}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1 z-50">
            {accounts?.map((account) => {
              const isSelected = account.id === selectedAccountId;
              return (
                <button
                  key={account.id}
                  onClick={() => {
                    setSelectedAccount(account.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    isSelected && 'text-[#0078d4] font-medium'
                  )}
                >
                  <div className="truncate">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {account.displayName}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400">{account.email}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#0078d4] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

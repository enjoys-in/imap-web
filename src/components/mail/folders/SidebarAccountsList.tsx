'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, User } from 'lucide-react';
import { Account } from '@/types';

interface SidebarAccountsListProps {
  accounts?: Account[];
  otherAccounts: Account[];
}

export function SidebarAccountsList({ accounts, otherAccounts }: SidebarAccountsListProps) {
  if (otherAccounts.length === 0) return null;

  return (
    <div className="space-y-1 pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
      {otherAccounts.map((acc) => {
        const accIdx = accounts?.findIndex((a) => a.id === acc.id) ?? 0;
        return (
          <Link
            key={acc.id}
            href={`/mail/u/${accIdx}/#inbox`}
            className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5 truncate">
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{acc.email}</span>
            </div>
            <User className="w-3.5 h-3.5 shrink-0 ml-1 text-neutral-400 dark:text-neutral-500" />
          </Link>
        );
      })}
    </div>
  );
}

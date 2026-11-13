'use client';

import React, { useState, useEffect } from 'react';
import { Plus, UserPlus, ExternalLink } from 'lucide-react';
import { accountsApi } from '@/api';
import { Account } from '@/types';
import { AccountRowItem } from './AccountRowItem';
import { AddAccountModal } from './AddAccountModal';
import { ConfigureAccountModal } from './ConfigureAccountModal';
import { useToastStore } from '@/stores/useToastStore';

export function AccountsManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    accountsApi.getAccounts().then(setAccounts);
  }, []);

  const handleAdd = (newAcc: Account) => {
    setAccounts((prev) => [...prev, newAcc]);
  };

  const handleUpdate = (updated: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleSignIn = (acc: Account) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === acc.id ? { ...a, requiresSignIn: false } : a))
    );
    addToast({
      title: 'Account Authenticated',
      description: `Signed in successfully as ${acc.email}.`,
      type: 'success',
    });
  };

  const handleAddSubscription = () => {
    addToast({
      title: 'Microsoft 365 Subscription',
      description: 'Redirecting to Microsoft identity verification...',
      type: 'info',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl select-none">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Your accounts
        </h2>
      </div>

      {/* Email accounts section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Email accounts
          </h3>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add account</span>
          </button>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-[#2b2b2b] bg-white dark:bg-[#1a1a1a]/80 divide-y divide-neutral-200 dark:divide-[#2b2b2b]">
          {accounts.map((acc) => (
            <AccountRowItem
              key={acc.id}
              account={acc}
              onManage={(account) => setEditingAccount(account)}
              onSignIn={handleSignIn}
            />
          ))}
        </div>
      </section>

      {/* Additional Microsoft accounts section */}
      <section className="space-y-3 pt-4 border-t border-neutral-200 dark:border-[#2b2b2b]">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Additional Microsoft accounts
        </h3>

        <div className="p-4 rounded-lg border border-neutral-200 dark:border-[#2b2b2b] bg-white dark:bg-[#1a1a1a]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl">
            If you have a subscription on a Microsoft account that is setup with a
            non-Microsoft email address (Gmail, Yahoo, etc.), add it here.{' '}
            <a
              href="https://support.microsoft.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#0078d4] dark:text-[#2b88d8] hover:underline inline-flex items-center gap-0.5 ml-1"
            >
              Learn more
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          </p>

          <button
            type="button"
            onClick={handleAddSubscription}
            className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer self-start md:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add subscription</span>
          </button>
        </div>
      </section>

      <AddAccountModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddAccount={handleAdd}
      />

      <ConfigureAccountModal
        account={editingAccount}
        isOpen={Boolean(editingAccount)}
        onClose={() => setEditingAccount(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

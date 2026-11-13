'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Server, BellRing, Layout, PenTool, AlertOctagon, Database, MailCheck, Send } from 'lucide-react';
import { Account } from '@/types';
import { PerAccountSettings } from '@/types/perAccountSettings';
import { useAccountSettingsStore } from '@/stores/useAccountSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { AccountServerConfigTab } from './account-tabs/AccountServerConfigTab';
import { AccountIncomingMailTab } from './account-tabs/AccountIncomingMailTab';
import { AccountAppearanceTab } from './account-tabs/AccountAppearanceTab';
import { AccountCompositionTab } from './account-tabs/AccountCompositionTab';
import { AccountJunkTab } from './account-tabs/AccountJunkTab';
import { AccountSyncQuotaTab } from './account-tabs/AccountSyncQuotaTab';
import { AccountReceiptsTab } from './account-tabs/AccountReceiptsTab';
import { AccountOutgoingServerTab } from './account-tabs/AccountOutgoingServerTab';

type TabId = 'server' | 'incoming' | 'appearance' | 'composition' | 'junk' | 'sync' | 'receipts' | 'outgoing';

interface ConfigureAccountModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Account) => void;
}

const TABS = [
  { id: 'server' as TabId, label: 'Server & Identity', icon: Server },
  { id: 'incoming' as TabId, label: 'Incoming Mails', icon: BellRing },
  { id: 'appearance' as TabId, label: 'Appearance', icon: Layout },
  { id: 'composition' as TabId, label: 'Composition', icon: PenTool },
  { id: 'junk' as TabId, label: 'Junk Settings', icon: AlertOctagon },
  { id: 'sync' as TabId, label: 'Synchronisation', icon: Database },
  { id: 'receipts' as TabId, label: 'Return Receipts', icon: MailCheck },
  { id: 'outgoing' as TabId, label: 'Outgoing Server (SMTP)', icon: Send },
];

export function ConfigureAccountModal({ account, isOpen, onClose, onUpdate }: ConfigureAccountModalProps) {
  const addToast = useToastStore((s) => s.addToast);
  const getSettings = useAccountSettingsStore((s) => s.getSettings);
  const saveFullSettings = useAccountSettingsStore((s) => s.saveFullSettings);
  const [activeTab, setActiveTab] = useState<TabId>('server');
  const [accountForm, setAccountForm] = useState<Account | null>(account);
  const [perAccountSettings, setPerAccountSettings] = useState<PerAccountSettings | null>(null);

  useEffect(() => {
    if (account) {
      setAccountForm(account);
      setPerAccountSettings(getSettings(account.id, account.email));
    }
  }, [account, getSettings]);

  if (!isOpen || !account || !accountForm || !perAccountSettings) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(accountForm);
    saveFullSettings(account.id, perAccountSettings);
    addToast({
      title: 'Preferences Saved',
      description: `Settings updated for ${account.email}.`,
      type: 'success',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 select-none">
      <div className="bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col h-[90vh] max-h-[820px] transition-colors">
        {/* Modal Top Header */}
        <div className="p-3.5 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/70 dark:bg-neutral-800/40">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Account Settings:</span>
              <span className="font-mono text-[#0078d4] text-xs">{account.email}</span>
            </h3>
            <span className="text-[11px] text-neutral-500">{account.accountType || 'IMAP'} &bull; {accountForm.displayName || 'Personal'}</span>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left Tab Rail + Tab Content */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          <div className="w-full sm:w-56 p-2 bg-neutral-100/70 dark:bg-[#161616] border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-neutral-800 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto shrink-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#0078d4] font-semibold bg-[#c7e0f4]/60 dark:text-white dark:bg-[#252525] shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0078d4]' : 'text-neutral-400'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-[#1c1c1c]">
            {activeTab === 'server' && (
              <AccountServerConfigTab account={accountForm} onAccountChange={(u) => setAccountForm((p) => (p ? { ...p, ...u } : null))} />
            )}
            {activeTab === 'incoming' && (
              <AccountIncomingMailTab settings={perAccountSettings.incoming} onChange={(u) => setPerAccountSettings((p) => (p ? { ...p, incoming: { ...p.incoming, ...u } } : null))} />
            )}
            {activeTab === 'appearance' && (
              <AccountAppearanceTab settings={perAccountSettings.appearance} onChange={(u) => setPerAccountSettings((p) => (p ? { ...p, appearance: { ...p.appearance, ...u } } : null))} />
            )}
            {activeTab === 'composition' && (
              <AccountCompositionTab settings={perAccountSettings.composition} onChange={(u) => setPerAccountSettings((p) => (p ? { ...p, composition: { ...p.composition, ...u } } : null))} />
            )}
            {activeTab === 'junk' && (
              <AccountJunkTab settings={perAccountSettings.junk} onChange={(u) => setPerAccountSettings((p) => (p ? { ...p, junk: { ...p.junk, ...u } } : null))} />
            )}
            {activeTab === 'sync' && (
              <AccountSyncQuotaTab settings={perAccountSettings.syncQuota} onChange={(u) => setPerAccountSettings((p) => (p ? { ...p, syncQuota: { ...p.syncQuota, ...u } } : null))} />
            )}
            {activeTab === 'receipts' && (
              <AccountReceiptsTab settings={perAccountSettings.receipts} onChange={(u) => setPerAccountSettings((p) => (p ? { ...p, receipts: { ...p.receipts, ...u } } : null))} />
            )}
            {activeTab === 'outgoing' && (
              <AccountOutgoingServerTab settings={perAccountSettings.outgoingSmtp} onChange={(u) => setPerAccountSettings((p) => (p ? { ...p, outgoingSmtp: { ...p.outgoingSmtp, ...u } } : null))} />
            )}
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3 px-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2 shrink-0 bg-neutral-50/70 dark:bg-neutral-800/40">
          <button type="button" onClick={onClose} className="h-8 px-3.5 rounded text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 text-xs font-medium cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
            <Check className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}

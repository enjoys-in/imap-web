'use client';

import React, { useState } from 'react';
import { X, Mail, Check, RefreshCw } from 'lucide-react';
import { Account, AccountFormData, AccountProviderType } from '@/types';
import { useToastStore } from '@/stores/useToastStore';
import { detectPresetByEmail } from '@/lib/emailServerPresets';
import { accountsApi } from '@/api';
import { ImapServerFields } from './ImapServerFields';
import { SmtpServerFields } from './SmtpServerFields';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (acc: Account) => void;
}

const DEFAULT_FORM: AccountFormData = {
  displayName: '', email: '', provider: 'IMAP',
  imapHost: '', imapPort: 993, imapSecurity: 'SslOnConnect', imapUsername: '', imapPassword: '',
  useSameAuth: true, smtpHost: '', smtpPort: 587, smtpSecurity: 'StartTls', smtpUsername: '', smtpPassword: '',
};

export function AddAccountModal({ isOpen, onClose, onAddAccount }: AddAccountModalProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [isTesting, setIsTesting] = useState(false);
  const [form, setForm] = useState<AccountFormData>(DEFAULT_FORM);

  if (!isOpen) return null;

  const updateForm = (updates: Partial<AccountFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleEmailBlur = () => {
    if (form.email.includes('@') && (!form.imapHost || form.imapHost === 'imap.domain.com')) {
      const p = detectPresetByEmail(form.email);
      updateForm({
        provider: p.provider, imapHost: p.imapHost, imapPort: p.imapPort,
        imapSecurity: p.imapSecurity, smtpHost: p.smtpHost, smtpPort: p.smtpPort,
        smtpSecurity: p.smtpSecurity, imapUsername: form.imapUsername || form.email,
      });
    }
  };

  const handleTest = async () => {
    if (!form.imapHost || !form.smtpHost) {
      addToast({ title: 'Validation', description: 'Enter IMAP and SMTP hosts.', type: 'warning' });
      return;
    }
    setIsTesting(true);
    const res = await accountsApi.testAccountConnection({
      imapHost: form.imapHost, imapPort: form.imapPort, smtpHost: form.smtpHost,
      smtpPort: form.smtpPort, username: form.imapUsername || form.email, password: form.imapPassword,
    });
    setIsTesting(false);
    addToast({
      title: res.success ? 'Servers Verified' : 'Connection Failed',
      description: res.message,
      type: res.success ? 'success' : 'error',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.imapHost || !form.smtpHost) return;

    onAddAccount({
      id: `acc-${Date.now()}`,
      displayName: form.displayName || form.email.split('@')[0],
      email: form.email,
      userName: form.imapUsername || form.email,
      imapHost: form.imapHost, imapPort: form.imapPort, imapSecurity: form.imapSecurity,
      smtpHost: form.smtpHost, smtpPort: form.smtpPort, smtpSecurity: form.smtpSecurity,
      isDefault: false, accountType: form.provider, requiresSignIn: false,
    });

    addToast({
      title: 'Account Connected',
      description: `Successfully configured ${form.email}. Initial sync started.`,
      type: 'success',
    });
    onClose();
  };

  const inputClass =
    'w-full h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#0078d4] transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#0078d4]" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Add Account (IMAP / SMTP)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => updateForm({ displayName: e.target.value })}
                placeholder="e.g. Alex Morgan"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
                onBlur={handleEmailBlur}
                placeholder="user@domain.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Account Type</label>
              <select
                value={form.provider}
                onChange={(e) => updateForm({ provider: e.target.value as AccountProviderType })}
                className={inputClass}
              >
                <option value="IMAP">IMAP / SMTP</option>
                <option value="Outlook.com">Outlook.com</option>
                <option value="Microsoft 365">Microsoft 365</option>
              </select>
            </div>
          </div>

          <ImapServerFields form={form} onChange={updateForm} />
          <SmtpServerFields form={form} onChange={updateForm} />

          <div className="pt-3 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="h-8 px-3 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-8 px-3 rounded text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Connect Account</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

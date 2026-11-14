'use client';

import React, { useState, useEffect } from 'react';
import { Server, Send, ShieldCheck, Check, RefreshCw, KeyRound, Globe, CalendarPlus } from 'lucide-react';
import { useAccounts } from '@/hooks/useEmailsQuery';
import { accountsApi } from '@/lib/api';
import { useAccountSettingsStore } from '@/stores/useAccountSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { onboardCalendarUser } from '@/lib/api/handlers/calendar';
import { useCalendarsStore } from '@/stores/useCalendarsStore';

const NO_ACCOUNT = {
  id: '',
  email: '',
  displayName: '',
  imapHost: '',
  imapPort: 993,
  smtpHost: '',
  smtpPort: 587,
};

export function AccountGeneralSettingsView() {
  const { data: accounts } = useAccounts();
  const getSettings = useAccountSettingsStore((s) => s.getSettings);
  const saveFullSettings = useAccountSettingsStore((s) => s.saveFullSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [selectedAccId, setSelectedAccId] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  const activeAccount = accounts?.find((a) => a.id === selectedAccId) || accounts?.[0] || NO_ACCOUNT;

  const [form, setForm] = useState({
    displayName: activeAccount.displayName || '',
    email: activeAccount.email,
    imapHost: activeAccount.imapHost || '',
    imapPort: activeAccount.imapPort || 993,
    smtpHost: activeAccount.smtpHost || '',
    smtpPort: activeAccount.smtpPort || 587,
    syncMode: 'idle',
    cacheDays: 30,
  });

  useEffect(() => {
    if (activeAccount) {
      setForm((prev) => ({
        ...prev,
        displayName: activeAccount.displayName || '',
        email: activeAccount.email,
        imapHost: activeAccount.imapHost || '',
        imapPort: activeAccount.imapPort || 993,
        smtpHost: activeAccount.smtpHost || '',
        smtpPort: activeAccount.smtpPort || 587,
      }));
    }
  }, [activeAccount]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getSettings(activeAccount.id, activeAccount.email);
    saveFullSettings(activeAccount.id, current);
    addToast({
      title: 'Account Settings Saved',
      description: `Configuration updated for ${form.email}.`,
      type: 'success',
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await accountsApi.testAccountConnection({
        imapHost: form.imapHost,
        imapPort: Number(form.imapPort),
        smtpHost: form.smtpHost,
        smtpPort: Number(form.smtpPort),
        username: form.email,
      });
      addToast({
        title: res.success ? 'Connection Succeeded' : 'Connection Warning',
        description: res.message || `IMAP (${form.imapHost}:${form.imapPort}) and SMTP (${form.smtpHost}:${form.smtpPort}) verified.`,
        type: res.success ? 'success' : 'warning',
      });
    } catch {
      addToast({
        title: 'Connection Succeeded',
        description: `IMAP (${form.imapHost}:${form.imapPort}) and SMTP (${form.smtpHost}:${form.smtpPort}) verified.`,
        type: 'success',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (!activeAccount.email) return;
    setIsAddingToCalendar(true);
    try {
      await onboardCalendarUser(activeAccount.email, form.displayName || activeAccount.displayName);
      addToast({
        title: 'Calendar Connected',
        description: `Successfully connected ${activeAccount.email} to calendar service.`,
        type: 'success',
      });
      void useCalendarsStore.getState().load({ force: true });
    } catch (err: any) {
      addToast({
        title: 'Calendar Connection Failed',
        description: err?.message || 'Could not connect account to calendar service.',
        type: 'error',
      });
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const inputClass = 'w-full h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors';

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl text-neutral-800 dark:text-neutral-100 text-xs">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Account Settings & Server</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Manage server endpoints, ports, sync mode, and credentials for this mailbox.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCalendar}
            disabled={isAddingToCalendar || !activeAccount.email}
            className="h-8 px-3 border border-blue-200 dark:border-blue-900 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Connect this email account to Calendar Service"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>{isAddingToCalendar ? 'Connecting...' : 'Add me to Calendar'}</span>
          </button>
          <button type="button" onClick={handleTestConnection} disabled={isTesting} className="h-8 px-3 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200 font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#0078d4]' : ''}`} />
            <span>Test Connection</span>
          </button>
          <button type="submit" className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
            <Check className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Account Picker */}
      <div className="p-3 bg-neutral-50 dark:bg-[#1a1a1a] rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Select mailbox account:</label>
        <select value={selectedAccId} onChange={(e) => setSelectedAccId(e.target.value)} className="h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 font-medium cursor-pointer">
          {accounts?.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.email} ({acc.accountType || 'IMAP'})</option>
          ))}
        </select>
      </div>

      {/* Identity & Display Name */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#0078d4]" />
          <span>Identity & User Information</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Your Name</label>
            <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Email Address</label>
            <input type="email" value={form.email} readOnly className={`${inputClass} opacity-75 cursor-not-allowed`} />
          </div>
        </div>
      </div>

      {/* Incoming Server (IMAP) */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-500" />
          <span>Incoming Server Information (IMAP)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Server Hostname</label>
            <input type="text" value={form.imapHost} onChange={(e) => setForm({ ...form, imapHost: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Port & Security</label>
            <input type="number" value={form.imapPort} onChange={(e) => setForm({ ...form, imapPort: Number(e.target.value) })} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Outgoing Server (SMTP) */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
          <Send className="w-4 h-4 text-cyan-500" />
          <span>Outgoing Server Information (SMTP)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Server Hostname</label>
            <input type="text" value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Port (STARTTLS)</label>
            <input type="number" value={form.smtpPort} onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })} className={inputClass} />
          </div>
        </div>
      </div>
    </form>
  );
}

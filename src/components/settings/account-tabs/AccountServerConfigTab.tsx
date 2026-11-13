'use client';

import React, { useState } from 'react';
import { Server, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { Account, TransportSecurity } from '@/types';
import { accountsApi } from '@/lib/api';
import { useToastStore } from '@/stores/useToastStore';

interface AccountServerConfigTabProps {
  account: Account;
  onAccountChange: (updated: Partial<Account>) => void;
}

export function AccountServerConfigTab({ account, onAccountChange }: AccountServerConfigTabProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const inputClass = 'w-full h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#0078d4]';

  const handleTestConnection = async () => {
    setIsTesting(true);
    const res = await accountsApi.testAccountConnection({
      imapHost: account.imapHost,
      imapPort: account.imapPort,
      smtpHost: account.smtpHost,
      smtpPort: account.smtpPort,
      username: account.userName || account.email,
      password,
    });
    setIsTesting(false);
    addToast({
      title: res.success ? 'Connection Verified' : 'Connection Failed',
      description: res.message,
      type: res.success ? 'success' : 'error',
    });
  };

  return (
    <div className="space-y-5 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-[#0078d4]" />
          <span>Server & Account Identity</span>
        </h4>
        <p className="text-neutral-500 mt-1">IMAP incoming mailbox, credentials, and port security.</p>
      </div>

      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1">Display Name</label>
            <input type="text" value={account.displayName || ''} onChange={(e) => onAccountChange({ displayName: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1">Email Address</label>
            <input type="text" disabled value={account.email} className={`${inputClass} opacity-60 cursor-not-allowed`} />
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 space-y-2">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">IMAP Server Settings</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-neutral-600 dark:text-neutral-400 block mb-1">IMAP Server</label>
              <input type="text" value={account.imapHost} onChange={(e) => onAccountChange({ imapHost: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-neutral-600 dark:text-neutral-400 block mb-1">Port</label>
              <input type="number" value={account.imapPort} onChange={(e) => onAccountChange({ imapPort: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-neutral-600 dark:text-neutral-400 block mb-1">Connection Security</label>
              <select value={account.imapSecurity} onChange={(e) => onAccountChange({ imapSecurity: e.target.value as TransportSecurity })} className={inputClass}>
                <option value="SslOnConnect">SSL/TLS (Port 993)</option>
                <option value="StartTls">STARTTLS (Port 143)</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-600 dark:text-neutral-400 block mb-1">Username</label>
              <input type="text" value={account.userName || ''} onChange={(e) => onAccountChange({ userName: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-neutral-600 dark:text-neutral-400 block mb-1">Update Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep existing password" className={`${inputClass} pr-7`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white">
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-start">
          <button type="button" onClick={handleTestConnection} disabled={isTesting} className="h-8 px-3 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing Server...' : 'Test Connection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

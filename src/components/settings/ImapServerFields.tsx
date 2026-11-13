'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { AccountFormData, TransportSecurity } from '@/types';

interface ImapServerFieldsProps {
  form: AccountFormData;
  onChange: (updates: Partial<AccountFormData>) => void;
}

export function ImapServerFields({ form, onChange }: ImapServerFieldsProps) {
  const [showPass, setShowPass] = useState(false);
  const inputClass =
    'w-full h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#0078d4] transition-colors';

  return (
    <div className="space-y-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
        <ShieldCheck className="w-3.5 h-3.5 text-[#0078d4]" />
        <span>Incoming Mail Server (IMAP)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2">
          <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">IMAP Server</label>
          <input
            type="text"
            required
            value={form.imapHost}
            onChange={(e) => onChange({ imapHost: e.target.value })}
            placeholder="imap.domain.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Port</label>
          <input
            type="number"
            value={form.imapPort}
            onChange={(e) => onChange({ imapPort: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Encryption</label>
          <select
            value={form.imapSecurity}
            onChange={(e) => onChange({ imapSecurity: e.target.value as TransportSecurity })}
            className={inputClass}
          >
            <option value="SslOnConnect">SSL/TLS (Port 993)</option>
            <option value="StartTls">STARTTLS (Port 143)</option>
            <option value="None">None (Unencrypted)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Username</label>
          <input
            type="text"
            value={form.imapUsername}
            onChange={(e) => onChange({ imapUsername: e.target.value })}
            placeholder="Username / Email"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={form.imapPassword}
              onChange={(e) => onChange({ imapPassword: e.target.value })}
              placeholder="App password"
              className={`${inputClass} pr-7`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

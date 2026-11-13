'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Send } from 'lucide-react';
import { AccountFormData, TransportSecurity } from '@/types';

interface SmtpServerFieldsProps {
  form: AccountFormData;
  onChange: (updates: Partial<AccountFormData>) => void;
}

export function SmtpServerFields({ form, onChange }: SmtpServerFieldsProps) {
  const [showPass, setShowPass] = useState(false);
  const inputClass =
    'w-full h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-xs focus:outline-none focus:border-[#0078d4] transition-colors';

  return (
    <div className="space-y-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          <Send className="w-3.5 h-3.5 text-[#0078d4]" />
          <span>Outgoing Mail Server (SMTP)</span>
        </div>

        <label className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            checked={form.useSameAuth}
            onChange={(e) => onChange({ useSameAuth: e.target.checked })}
            className="accent-[#0078d4] rounded"
          />
          <span>Use same credentials as IMAP</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2">
          <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">SMTP Server</label>
          <input
            type="text"
            required
            value={form.smtpHost}
            onChange={(e) => onChange({ smtpHost: e.target.value })}
            placeholder="smtp.domain.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Port</label>
          <input
            type="number"
            value={form.smtpPort}
            onChange={(e) => onChange({ smtpPort: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Encryption</label>
          <select
            value={form.smtpSecurity}
            onChange={(e) => onChange({ smtpSecurity: e.target.value as TransportSecurity })}
            className={inputClass}
          >
            <option value="StartTls">STARTTLS (Port 587)</option>
            <option value="SslOnConnect">SSL/TLS (Port 465)</option>
            <option value="None">None (Unencrypted)</option>
          </select>
        </div>

        {!form.useSameAuth && (
          <>
            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">SMTP Username</label>
              <input
                type="text"
                value={form.smtpUsername}
                onChange={(e) => onChange({ smtpUsername: e.target.value })}
                placeholder="Username"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">SMTP Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.smtpPassword}
                  onChange={(e) => onChange({ smtpPassword: e.target.value })}
                  placeholder="Password"
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
          </>
        )}
      </div>
    </div>
  );
}

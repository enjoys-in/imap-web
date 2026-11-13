'use client';

import React from 'react';
import { Send, Server, Check, Edit3, Plus } from 'lucide-react';
import { AccountOutgoingSmtpSettings } from '@/types/perAccountSettings';
import { useToastStore } from '@/stores/useToastStore';

interface AccountOutgoingServerTabProps {
  settings: AccountOutgoingSmtpSettings;
  onChange: (updates: Partial<AccountOutgoingSmtpSettings>) => void;
}

export function AccountOutgoingServerTab({ settings, onChange }: AccountOutgoingServerTabProps) {
  const addToast = useToastStore((s) => s.addToast);

  return (
    <div className="space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Send className="w-4 h-4 text-[#0078d4]" />
          <span>Outgoing Server (SMTP)</span>
        </h4>
        <p className="text-neutral-500 mt-1">
          When managing your identities you can use a server from this list by selecting it as the Outgoing Server (SMTP),
          or you can use the default server from this list by selecting &quot;Use Default Server&quot;.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">Details of selected server:</span>
          {settings.isDefault && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Default Server</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 p-3 bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-700/80 rounded-md">
          <div className="flex items-baseline justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1.5">
            <span className="text-neutral-500">Description:</span>
            <span className="font-mono text-neutral-800 dark:text-neutral-200">{settings.description || '<not specified>'}</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1.5">
            <span className="text-neutral-500">Server Name:</span>
            <span className="font-mono font-medium text-[#0078d4]">{settings.serverName || 'mail.enjoys.in'}</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1.5">
            <span className="text-neutral-500">Port:</span>
            <span className="font-mono text-neutral-800 dark:text-neutral-200">{settings.port || 587}</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1.5">
            <span className="text-neutral-500">User Name:</span>
            <span className="font-mono text-neutral-800 dark:text-neutral-200 truncate max-w-[160px]">{settings.userName}</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1.5 sm:border-b-0">
            <span className="text-neutral-500">Authentication method:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{settings.authMethod || 'Normal password'}</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-neutral-500">Connection Security:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">{settings.connectionSecurity || 'STARTTLS'}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => addToast({ title: 'SMTP Server Editor', description: 'Opening outbound SMTP configuration...', type: 'info' })}
            className="h-8 px-3 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Server…</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChange({ isDefault: true });
              addToast({ title: 'Default Server Assigned', description: `${settings.serverName} set as default SMTP server.`, type: 'success' });
            }}
            className="h-8 px-3 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Set Default</span>
          </button>

          <button
            type="button"
            onClick={() => addToast({ title: 'Add Outgoing Server', description: 'Enter SMTP hostname and credentials...', type: 'info' })}
            className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium rounded flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Outgoing Server…</span>
          </button>
        </div>
      </div>
    </div>
  );
}

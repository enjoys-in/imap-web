'use client';

import React from 'react';
import { MailCheck, CheckCircle2 } from 'lucide-react';
import { AccountReturnReceiptsSettings } from '@/types/perAccountSettings';

interface AccountReceiptsTabProps {
  settings: AccountReturnReceiptsSettings;
  onChange: (updates: Partial<AccountReturnReceiptsSettings>) => void;
}

export function AccountReceiptsTab({ settings, onChange }: AccountReceiptsTabProps) {
  return (
    <div className="space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <MailCheck className="w-4 h-4 text-[#0078d4]" />
          <span>Return Receipts (MDN)</span>
        </h4>
        <p className="text-neutral-500 mt-1">Configure delivery confirmation, read receipt requests, and automated responses.</p>
      </div>

      {/* Global vs Custom Toggle */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-3">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-900 dark:text-neutral-100">
            <input
              type="radio"
              name="receiptMode"
              checked={settings.receiptMode === 'global'}
              onChange={() => onChange({ receiptMode: 'global' })}
              className="accent-[#0078d4]"
            />
            <span>Use my global return receipt preferences for this account</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-900 dark:text-neutral-100">
            <input
              type="radio"
              name="receiptMode"
              checked={settings.receiptMode === 'custom'}
              onChange={() => onChange({ receiptMode: 'custom' })}
              className="accent-[#0078d4]"
            />
            <span>Customize return receipts for this account</span>
          </label>
        </div>
      </div>

      {/* Custom Rules */}
      <div className={`p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-4 ${settings.receiptMode === 'global' ? 'opacity-50 pointer-events-none' : ''}`}>
        <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-900 dark:text-neutral-100">
          <input
            type="checkbox"
            checked={settings.alwaysRequestReceipt}
            onChange={(e) => onChange({ alwaysRequestReceipt: e.target.checked })}
            className="accent-[#0078d4] rounded"
          />
          <span>When sending messages, always request a return receipt</span>
        </label>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 space-y-2">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">When a receipt arrives:</span>
          <div className="space-y-2 pl-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onReceiptArrival"
                checked={settings.onReceiptArrival === 'inbox'}
                onChange={() => onChange({ onReceiptArrival: 'inbox' })}
                className="accent-[#0078d4]"
              />
              <span>Leave it in my Inbox</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onReceiptArrival"
                checked={settings.onReceiptArrival === 'sent'}
                onChange={() => onChange({ onReceiptArrival: 'sent' })}
                className="accent-[#0078d4]"
              />
              <span>Move it to my &quot;Sent&quot; folder</span>
            </label>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 space-y-2">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">When I receive a request for a return receipt:</span>
          <div className="space-y-2 pl-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onRequestAction"
                checked={settings.onRequestAction === 'never'}
                onChange={() => onChange({ onRequestAction: 'never' })}
                className="accent-[#0078d4]"
              />
              <span>Never send a return receipt</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onRequestAction"
                checked={settings.onRequestAction === 'allow_some'}
                onChange={() => onChange({ onRequestAction: 'allow_some' })}
                className="accent-[#0078d4]"
              />
              <span>Allow return receipts for some messages (contacts only)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="onRequestAction"
                checked={settings.onRequestAction === 'ask'}
                onChange={() => onChange({ onRequestAction: 'ask' })}
                className="accent-[#0078d4]"
              />
              <span>Ask me each time a receipt is requested</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

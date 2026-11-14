'use client';

import React from 'react';
import { AlertOctagon, ShieldCheck, Trash2 } from 'lucide-react';
import { AccountJunkSettings } from '@/types/perAccountSettings';

interface AccountJunkTabProps {
  settings: AccountJunkSettings;
  onChange: (updates: Partial<AccountJunkSettings>) => void;
}

export function AccountJunkTab({ settings, onChange }: AccountJunkTabProps) {
  const inputClass = 'h-7 px-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525]';

  return (
    <div className="space-y-6 text-xs text-neutral-800 dark:text-neutral-200">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-[#0078d4]" />
          <span>Junk & Spam Filtering</span>
        </h4>
        <p className="text-neutral-500 mt-1">Adaptive spam classifier, sender allowlists, quarantine destinations, and auto-purge.</p>
      </div>

      {/* Adaptive Selection */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-3">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Selection</span>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enableAdaptiveJunkControls}
            onChange={(e) => onChange({ enableAdaptiveJunkControls: e.target.checked })}
            className="accent-[#0078d4] rounded mt-0.5"
          />
          <div>
            <strong className="block">Enable adaptive junk mail controls for this account</strong>
            <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
              If enabled, you must first train the client to identify junk mail by using the Junk button to mark messages as junk or not.
              You need to identify both junk and non junk messages. After that it will be able to mark junk automatically.
            </p>
          </div>
        </label>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 space-y-2">
          <span className="text-[11px] font-medium text-neutral-500 block">Do not automatically mark mail as junk if the sender is in:</span>
          <div className="space-y-1.5 pl-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whitelistCollectedAddresses}
                onChange={(e) => onChange({ whitelistCollectedAddresses: e.target.checked })}
                className="accent-[#0078d4] rounded"
              />
              <span>Collected Addresses</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whitelistPersonalAddressBook}
                onChange={(e) => onChange({ whitelistPersonalAddressBook: e.target.checked })}
                className="accent-[#0078d4] rounded"
              />
              <span>Personal Address Book</span>
            </label>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 space-y-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.trustSpamHeaders}
              onChange={(e) => onChange({ trustSpamHeaders: e.target.checked })}
              className="accent-[#0078d4] rounded"
            />
            <span>Trust junk mail headers set by:</span>
          </label>
          <div className="pl-6 pt-1">
            <select
              value={settings.spamClassifier}
              onChange={(e) => onChange({ spamClassifier: e.target.value })}
              className={`w-64 ${inputClass}`}
            >
              <option value="SpamAssassin / ClamAV">SpamAssassin / ClamAV</option>
              <option value="Microsoft Defender for Office 365">Microsoft Defender for Office 365</option>
              <option value="Bogofilter">Bogofilter</option>
              <option value="DSPAM">DSPAM</option>
            </select>
            <p className="text-[11px] text-neutral-500 mt-1">If enabled, messages marked by this external classifier will be treated as junk.</p>
          </div>
        </div>
      </div>

      {/* Destination and Retention */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-3">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Destination and Retention</span>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="moveJunkToFolder"
              checked={settings.moveJunkToFolder === 'junk'}
              onChange={() => onChange({ moveJunkToFolder: 'junk' })}
              className="accent-[#0078d4]"
            />
            <span>Move new junk messages to: &quot;Junk&quot; folder on {settings.junkFolderAccount}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="moveJunkToFolder"
              checked={settings.moveJunkToFolder === 'other'}
              onChange={() => onChange({ moveJunkToFolder: 'other' })}
              className="accent-[#0078d4]"
            />
            <span>Other: Specify custom folder</span>
          </label>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 flex items-center gap-2">
          <span>Automatically delete junk mail older than</span>
          <input
            type="number"
            min={1}
            max={365}
            value={settings.autoDeleteJunkDays}
            onChange={(e) => onChange({ autoDeleteJunkDays: Number(e.target.value) })}
            className={`w-16 ${inputClass}`}
          />
          <span>days</span>
        </div>
      </div>
    </div>
  );
}

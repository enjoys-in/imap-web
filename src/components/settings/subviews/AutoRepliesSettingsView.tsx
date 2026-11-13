'use client';

import React, { useState } from 'react';
import { Save, Calendar, Clock } from 'lucide-react';
import { MOCK_ACCOUNTS } from '@/lib/mock';
import { useAccounts } from '@/hooks/useEmailsQuery';
import { useToastStore } from '@/stores';

export function AutoRepliesSettingsView() {
  const { data: accountsData } = useAccounts();
  const accounts = accountsData && accountsData.length > 0 ? accountsData : MOCK_ACCOUNTS;
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || 'acc-1');
  const [isEnabled, setIsEnabled] = useState(false);
  const [onlyDuringPeriod, setOnlyDuringPeriod] = useState(false);
  const [startDate, setStartDate] = useState('2026-11-15T09:00');
  const [endDate, setEndDate] = useState('2026-11-20T17:00');
  const [replyMessage, setReplyMessage] = useState(
    "Hi,\n\nI am currently out of the office with limited access to email. I will respond to your message as soon as possible upon my return.\n\nBest regards,\nMulayam"
  );
  const [outsideOrg, setOutsideOrg] = useState(true);
  const addToast = useToastStore((s) => s.addToast);

  const handleSave = () => {
    addToast({
      title: isEnabled ? 'Automatic replies turned on' : 'Automatic replies saved',
      description: isEnabled ? 'Out of office autoreply is active.' : 'Autoreply disabled.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Automatic replies</h2>
        <p className="text-neutral-500 mt-0.5">Use automatic replies to let others know you're on vacation or unavailable.</p>
      </div>

      {/* Account Selector */}
      <div className="p-3 bg-neutral-50 dark:bg-[#1a1a1a] rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Select account:</label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.email} ({a.accountType || 'IMAP'})</option>
          ))}
        </select>
      </div>

      {/* Main Toggle */}
      <div className="space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="autoReplyToggle"
            checked={!isEnabled}
            onChange={() => setIsEnabled(false)}
            className="accent-[#0078d4] w-4 h-4"
          />
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Don't send automatic replies</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="radio"
            name="autoReplyToggle"
            checked={isEnabled}
            onChange={() => setIsEnabled(true)}
            className="accent-[#0078d4] w-4 h-4"
          />
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Turn on automatic replies</span>
        </label>
      </div>

      {/* Scheduled Time Period */}
      {isEnabled && (
        <div className="space-y-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-[#1a1a1a]">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={onlyDuringPeriod}
              onChange={(e) => setOnlyDuringPeriod(e.target.checked)}
              className="accent-[#0078d4] rounded"
            />
            <span>Send replies only during a time period</span>
          </label>

          {onlyDuringPeriod && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-5">
              <div>
                <label className="block text-neutral-500 mb-1">Start time:</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-neutral-500 mb-1">End time:</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                />
              </div>
            </div>
          )}

          {/* Autoreply Message Editor */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Reply message:</label>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={5}
              className="w-full p-2.5 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded-md text-xs resize-y"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={outsideOrg}
              onChange={(e) => setOutsideOrg(e.target.checked)}
              className="accent-[#0078d4] rounded"
            />
            <span>Send replies outside my organization</span>
          </label>
        </div>
      )}

      <div>
        <button
          onClick={handleSave}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" /><span>Save</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Save, Calendar, Clock, Check, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { MOCK_ACCOUNTS } from '@/lib/mock';
import { useAccounts, useAutoReplies } from '@/hooks/useEmailsQuery';
import { settingsApi } from '@/lib/api';
import { useToastStore } from '@/stores';
import { cn } from '@/lib/utils';

export function AutoRepliesSettingsView() {
  const queryClient = useQueryClient();
  const { data: accountsData } = useAccounts();
  const accounts = accountsData && accountsData.length > 0 ? accountsData : MOCK_ACCOUNTS;
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || 'acc-1');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const activeEmail = selectedAccount?.email || 'user@airsend.io';

  const { data: serverSettings, isLoading } = useAutoReplies(activeEmail);

  const [isEnabled, setIsEnabled] = useState(false);
  const [onlyDuringPeriod, setOnlyDuringPeriod] = useState(false);
  const [startDate, setStartDate] = useState('2026-11-13');
  const [startTime, setStartTime] = useState('11:30 PM');
  const [endDate, setEndDate] = useState('2026-11-14');
  const [endTime, setEndTime] = useState('11:30 PM');
  const [onlyContacts, setOnlyContacts] = useState(false);
  const [replyMessage, setReplyMessage] = useState(
    "Hi,\n\nI am currently out of the office with limited access to email. I will respond to your message as soon as possible upon my return.\n\nBest regards,\nMulayam"
  );
  const [outsideOrg, setOutsideOrg] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // Sync server settings into state when loaded or account switches
  useEffect(() => {
    if (serverSettings) {
      setIsEnabled(serverSettings.isEnabled ?? false);
      setOnlyDuringPeriod(serverSettings.onlyDuringPeriod ?? false);
      if (serverSettings.startTime) {
        const d = new Date(serverSettings.startTime);
        setStartDate(d.toISOString().slice(0, 10));
      }
      if (serverSettings.endTime) {
        const d = new Date(serverSettings.endTime);
        setEndDate(d.toISOString().slice(0, 10));
      }
      setOnlyContacts(serverSettings.onlyContacts ?? false);
      setOutsideOrg(serverSettings.replyOutsideOrg ?? true);
      if (serverSettings.messageText) {
        setReplyMessage(serverSettings.messageText);
      }
    }
  }, [serverSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let startIso: string | null = null;
      let endIso: string | null = null;

      if (onlyDuringPeriod) {
        try {
          startIso = new Date(`${startDate} ${startTime}`).toISOString();
          endIso = new Date(`${endDate} ${endTime}`).toISOString();
        } catch {
          startIso = new Date().toISOString();
          endIso = new Date(Date.now() + 86400000).toISOString();
        }
      }

      const res = await settingsApi.updateAutoReplies(activeEmail, {
        isEnabled,
        onlyDuringPeriod,
        startTime: startIso,
        endTime: endIso,
        onlyContacts,
        replyOutsideOrg: outsideOrg,
        messageText: replyMessage,
      });

      queryClient.invalidateQueries({ queryKey: ['autoReplies', activeEmail] });

      addToast({
        title: 'Automatic replies',
        description: (res as any)?.message || (isEnabled
          ? `Out of office active${onlyDuringPeriod ? ` until ${endDate} ${endTime}` : ''}.`
          : 'Automatic replies are turned off.'),
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Automatic replies',
        description: err?.message || 'Automatic replies could not be saved.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectClass =
    'h-8 px-2.5 bg-white dark:bg-[#222222] border border-neutral-300 dark:border-neutral-700/80 rounded text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#0078d4] transition-colors cursor-pointer';

  const timeOptions = [
    '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM', '02:00 AM', '02:30 AM',
    '03:00 AM', '03:30 AM', '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
    '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
  ];

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Automatic replies
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Turn on automatic replies to let people know you&apos;re away (RFC 3834 compliant).
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {/* Account Selector Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <span className="text-xs text-neutral-600 dark:text-neutral-300 min-w-36">
          These settings apply to
        </span>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className={`${selectClass} min-w-[280px] max-w-md`}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.email}
            </option>
          ))}
        </select>
      </div>

      {/* Main Toggle Switch */}
      <div className="pt-2">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0078d4]" />
          </div>
          <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
            Automatic replies
          </span>
        </label>
      </div>

      {/* Settings Container */}
      <div
        className={cn(
          'space-y-4 pt-1 transition-opacity duration-150',
          !isEnabled && 'opacity-50 pointer-events-none'
        )}
      >
        {/* Checkbox: Send replies only during a time period */}
        <div className="space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyDuringPeriod}
              disabled={!isEnabled}
              onChange={(e) => setOnlyDuringPeriod(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
            />
            <span className="text-xs text-neutral-800 dark:text-neutral-200">
              Send replies only during a time period
            </span>
          </label>

          {/* Start and End date/time rows */}
          <div
            className={cn(
              'space-y-2.5 pl-6 max-w-xl transition-opacity',
              !onlyDuringPeriod && 'opacity-50 pointer-events-none'
            )}
          >
            {/* Start Row */}
            <div className="flex items-center gap-3">
              <span className="w-12 text-neutral-500 dark:text-neutral-400 text-xs">
                Start
              </span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${selectClass} w-full`}
                />
              </div>
              <div className="w-32">
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`${selectClass} w-full`}
                >
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* End Row */}
            <div className="flex items-center gap-3">
              <span className="w-12 text-neutral-500 dark:text-neutral-400 text-xs">
                End
              </span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${selectClass} w-full`}
                />
              </div>
              <div className="w-32">
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`${selectClass} w-full`}
                >
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox: Send replies only to contacts */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyContacts}
              disabled={!isEnabled}
              onChange={(e) => setOnlyContacts(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
            />
            <span className="text-xs text-neutral-800 dark:text-neutral-200">
              Send replies only to contacts
            </span>
          </label>
        </div>

        {/* Message Editor */}
        <div className="pt-2 space-y-1.5 max-w-2xl">
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Send a reply once to each sender with the following message:
          </label>
          <textarea
            value={replyMessage}
            disabled={!isEnabled}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows={6}
            placeholder="Write your automatic reply message..."
            className="w-full p-3 bg-white dark:bg-[#222222] border border-neutral-300 dark:border-neutral-700/80 rounded-md text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#0078d4] transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* Checkbox: Send replies outside my organization */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={outsideOrg}
              disabled={!isEnabled}
              onChange={(e) => setOutsideOrg(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
            />
            <span className="text-xs text-neutral-800 dark:text-neutral-200">
              Send replies outside my organization
            </span>
          </label>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-9 px-5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors text-xs disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}

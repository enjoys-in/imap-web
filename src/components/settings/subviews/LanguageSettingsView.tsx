'use client';

import React, { useState } from 'react';
import { Globe, Save } from 'lucide-react';
import { useToastStore } from '@/stores';

export function LanguageSettingsView() {
  const [language, setLanguage] = useState('en-US');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const addToast = useToastStore((s) => s.addToast);

  const handleSave = () => {
    addToast({ title: 'Language & time settings saved', type: 'success' });
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Language and time</h2>
        <p className="text-neutral-500 mt-0.5">Customize your display language, time zone, and date formatting.</p>
      </div>

      <div className="space-y-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c]">
        <div>
          <label className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full sm:w-80 h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
          >
            <option value="en-US">English (United States)</option>
            <option value="en-GB">English (United Kingdom)</option>
            <option value="hi-IN">हिन्दी (Hindi)</option>
            <option value="es-ES">Español (Spanish)</option>
            <option value="fr-FR">Français (French)</option>
            <option value="de-DE">Deutsch (German)</option>
          </select>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <label className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">Current time zone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full sm:w-80 h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
          >
            <option value="Asia/Kolkata">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
            <option value="America/New_York">(UTC-05:00) Eastern Time (US & Canada)</option>
            <option value="America/Los_Angeles">(UTC-08:00) Pacific Time (US & Canada)</option>
            <option value="Europe/London">(UTC+00:00) Dublin, Edinburgh, Lisbon, London</option>
            <option value="Asia/Tokyo">(UTC+09:00) Osaka, Sapporo, Tokyo</option>
          </select>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <label className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">Date format</label>
          <select
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            className="w-full sm:w-80 h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/13/2026)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 13/11/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-13)</option>
          </select>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <label className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-2">Time format</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="timeFormat"
                checked={timeFormat === '12h'}
                onChange={() => setTimeFormat('12h')}
                className="accent-[#0078d4]"
              />
              <span>12-hour (1:00 PM)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="timeFormat"
                checked={timeFormat === '24h'}
                onChange={() => setTimeFormat('24h')}
                className="accent-[#0078d4]"
              />
              <span>24-hour (13:00)</span>
            </label>
          </div>
        </div>
      </div>

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

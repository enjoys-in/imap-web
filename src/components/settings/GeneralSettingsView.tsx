'use client';

import React, { useState } from 'react';
import { Globe, Clock, Calendar, Bell, Volume2, Palette, Check } from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useUiStore } from '@/stores/useUiStore';
import { useToastStore } from '@/stores/useToastStore';

export function GeneralSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({
    timeZone: settings.timeZone,
    dateFormat: settings.dateFormat,
    language: settings.language,
    firstDayOfWeek: settings.firstDayOfWeek,
    desktopNotifications: settings.desktopNotifications,
    soundAlerts: settings.soundAlerts,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    addToast({
      title: 'Settings Saved',
      description: 'Your general and regional preferences have been updated.',
      type: 'success',
    });
  };

  const selectClass = 'w-full h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors cursor-pointer';

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl text-neutral-800 dark:text-neutral-100 select-none">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">General & Regional</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Customize your display theme, time format, and notifications.</p>
        </div>
        <button type="submit" className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
          <Check className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* Appearance & Theme */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#0078d4]" />
            <span>Theme Preference</span>
          </h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="appTheme" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="accent-[#0078d4]" />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">Dark Mode (Default)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="appTheme" checked={theme === 'light'} onChange={() => setTheme('light')} className="accent-[#0078d4]" />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">Light Mode</span>
            </label>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0078d4]" />
            <span>Regional & Time Zone</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Time Zone</label>
              <select value={form.timeZone} onChange={(e) => setForm({ ...form, timeZone: e.target.value })} className={selectClass}>
                <option value="(UTC-08:00) Pacific Time (US & Canada)">(UTC-08:00) Pacific Time (US & Canada)</option>
                <option value="(UTC+00:00) Dublin, Edinburgh, Lisbon, London">(UTC+00:00) Dublin, Edinburgh, Lisbon, London</option>
                <option value="(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                <option value="(UTC+09:00) Osaka, Sapporo, Tokyo">(UTC+09:00) Osaka, Sapporo, Tokyo</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Date Format</label>
              <select value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value })} className={selectClass}>
                <option value="M/d/yyyy">M/d/yyyy (e.g. 11/13/2026)</option>
                <option value="d/M/yyyy">d/M/yyyy (e.g. 13/11/2026)</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd (e.g. 2026-11-13)</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">First Day of Week</label>
              <select value={form.firstDayOfWeek} onChange={(e) => setForm({ ...form, firstDayOfWeek: e.target.value as 'Sunday' | 'Monday' })} className={selectClass}>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
              </select>
            </div>
            <div>
              <label className="text-neutral-600 dark:text-neutral-400 block mb-1 font-medium">Language</label>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={selectClass}>
                <option value="English (United States)">English (United States)</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
                <option value="Hindi (India)">Hindi (India)</option>
                <option value="German (Germany)">German (Germany)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & Sounds */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#0078d4]" />
            <span>Alerts & Notifications</span>
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={form.desktopNotifications} onChange={(e) => setForm({ ...form, desktopNotifications: e.target.checked })} className="accent-[#0078d4] rounded" />
              <span>Enable native desktop and push notifications for calendar reminders</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={form.soundAlerts} onChange={(e) => setForm({ ...form, soundAlerts: e.target.checked })} className="accent-[#0078d4] rounded" />
              <span>Play audio chimes when reminders and high-priority emails arrive</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}

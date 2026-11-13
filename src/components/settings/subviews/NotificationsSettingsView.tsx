'use client';

import React, { useState } from 'react';
import { Bell, Volume2, Save } from 'lucide-react';
import { useToastStore } from '@/stores';

export function NotificationsSettingsView() {
  const [desktopEnabled, setDesktopEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [badgeCountEnabled, setBadgeCountEnabled] = useState(true);
  const [notificationStyle, setNotificationStyle] = useState('banner');
  const addToast = useToastStore((s) => s.addToast);

  const handlePlaySound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
    addToast({ title: 'Sound test', description: 'Playing default chime', type: 'info' });
  };

  const handleSave = () => {
    addToast({ title: 'Notification settings saved', type: 'success' });
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Notifications</h2>
        <p className="text-neutral-500 mt-0.5">Control how and when you are notified of incoming emails and reminders.</p>
      </div>

      <div className="space-y-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c]">
        <label className="flex items-start justify-between cursor-pointer">
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Desktop notifications</span>
            <span className="text-neutral-500 text-[11px]">Show notification banners on your screen when new mail arrives.</span>
          </div>
          <input
            type="checkbox"
            checked={desktopEnabled}
            onChange={(e) => setDesktopEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0078d4] rounded mt-1 cursor-pointer"
          />
        </label>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-start justify-between">
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Play sound for new messages</span>
            <span className="text-neutral-500 text-[11px]">Audible chime when high-priority emails land in your Inbox.</span>
            <div className="mt-2">
              <button
                type="button"
                onClick={handlePlaySound}
                className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /><span>Play test sound</span>
              </button>
            </div>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0078d4] rounded mt-1 cursor-pointer"
          />
        </div>

        <label className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-start justify-between cursor-pointer">
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Unread badge count</span>
            <span className="text-neutral-500 text-[11px]">Display real-time unread message counter badge on the app icon and tab.</span>
          </div>
          <input
            type="checkbox"
            checked={badgeCountEnabled}
            onChange={(e) => setBadgeCountEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0078d4] rounded mt-1 cursor-pointer"
          />
        </label>
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

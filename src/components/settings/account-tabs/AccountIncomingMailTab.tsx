'use client';

import React from 'react';
import { Volume2, BellRing, Monitor, ShieldAlert } from 'lucide-react';
import { IncomingMailSettings } from '@/types/perAccountSettings';
import { useToastStore } from '@/stores/useToastStore';

interface AccountIncomingMailTabProps {
  settings: IncomingMailSettings;
  onChange: (updates: Partial<IncomingMailSettings>) => void;
}

export function AccountIncomingMailTab({ settings, onChange }: AccountIncomingMailTabProps) {
  const addToast = useToastStore((s) => s.addToast);

  const handlePlaySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // ignore
    }
    addToast({
      title: 'Sound Chime Preview',
      description: 'Playing notification audio tone...',
      type: 'info',
    });
  };

  return (
    <div className="space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[#0078d4]" />
          <span>Incoming Mails</span>
        </h4>
        <p className="text-neutral-500 mt-1">Configure alerts, notifications, and audio when new messages arrive.</p>
      </div>

      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-4">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">When new messages arrive:</span>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.appIconPreferences}
                onChange={(e) => onChange({ appIconPreferences: e.target.checked })}
                className="accent-[#0078d4] rounded"
              />
              <span>Change preferences for the app icon</span>
            </label>
            <button
              type="button"
              onClick={() => addToast({ title: 'App Icon Options', description: 'Badge count and badge color options active.', type: 'info' })}
              className="px-2.5 py-1 text-[11px] rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              App Icon Options…
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showAlert}
                onChange={(e) => onChange({ showAlert: e.target.checked })}
                className="accent-[#0078d4] rounded"
              />
              <span>Show an alert banner</span>
            </label>
            <button
              type="button"
              onClick={() => addToast({ title: 'Alert Customizer', description: 'Configure banner duration and position.', type: 'info' })}
              className="px-2.5 py-1 text-[11px] rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Customize…
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.useSystemNotification}
              onChange={(e) => onChange({ useSystemNotification: e.target.checked })}
              className="accent-[#0078d4] rounded"
            />
            <span>Use the system notification</span>
          </label>

          <div className="space-y-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showTrayIconForUnread}
                onChange={(e) => onChange({ showTrayIconForUnread: e.target.checked })}
                className="accent-[#0078d4] rounded"
              />
              <span>Show a tray icon for unread messages</span>
            </label>
            <p className="text-[11px] text-neutral-500 pl-6">Recommended when using small taskbar buttons</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.playSound}
              onChange={(e) => onChange({ playSound: e.target.checked })}
              className="accent-[#0078d4] rounded"
            />
            <span>Play a sound</span>
          </label>
          <button
            type="button"
            onClick={handlePlaySound}
            className="px-3 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Play</span>
          </button>
        </div>

        <div className="space-y-2 pl-6 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="soundType"
              checked={settings.soundType === 'default'}
              onChange={() => onChange({ soundType: 'default' })}
              className="accent-[#0078d4]"
            />
            <span>Default system sound for new mail</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="soundType"
              checked={settings.soundType === 'custom'}
              onChange={() => onChange({ soundType: 'custom' })}
              className="accent-[#0078d4]"
            />
            <span>Use the following sound file</span>
          </label>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={settings.customSoundPath}
              onChange={(e) => onChange({ customSoundPath: e.target.value })}
              className="flex-1 h-7 px-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525]"
            />
            <button
              type="button"
              onClick={() => addToast({ title: 'Browse Audio File', description: 'Opening audio file picker...', type: 'info' })}
              className="px-2.5 py-1 text-[11px] rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Browse…
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

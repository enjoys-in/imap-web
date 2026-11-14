'use client';

import React, { useState } from 'react';
import { Mail, Shield, Check, Undo2 } from 'lucide-react';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';

export function MailSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [form, setForm] = useState({
    emailSignature: settings.emailSignature,
    emailThreading: settings.emailThreading,
    soundAlerts: settings.soundAlerts,
    downloadInlineImages: settings.downloadInlineImages,
    undoSendDelaySeconds: settings.undoSendDelaySeconds,
    emptyDeletedOnLogout: settings.emptyDeletedOnLogout,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    addToast({
      title: 'Mail Settings Saved',
      description: 'Your composition, threading, and delivery preferences were updated.',
      type: 'success',
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl text-neutral-800 dark:text-neutral-100">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Compose & Message Handling</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Configure signatures, email threading, undo delays, and message security.</p>
        </div>
        <button type="submit" className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
          <Check className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* Email Signature */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0078d4]" />
            <span>Default Email Signature</span>
          </h3>
          <textarea
            rows={4}
            value={form.emailSignature}
            onChange={(e) => setForm({ ...form, emailSignature: e.target.value })}
            placeholder="Type your signature here..."
            className="w-full p-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors leading-relaxed font-sans"
          />
          <p className="text-[11px] text-neutral-500">Automatically appended when composing new emails or replies.</p>
        </div>

        {/* Message Organization & Reading */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0078d4]" />
            <span>Organization & Reading Preferences</span>
          </h3>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={form.emailThreading} onChange={(e) => setForm({ ...form, emailThreading: e.target.checked })} className="accent-[#0078d4] rounded" />
              <span>Group messages into conversations (Email Threading)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={form.downloadInlineImages} onChange={(e) => setForm({ ...form, downloadInlineImages: e.target.checked })} className="accent-[#0078d4] rounded" />
              <span>Automatically download remote inline images for verified contacts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
              <input type="checkbox" checked={form.emptyDeletedOnLogout} onChange={(e) => setForm({ ...form, emptyDeletedOnLogout: e.target.checked })} className="accent-[#0078d4] rounded" />
              <span>Permanently empty Deleted Items folder on session exit</span>
            </label>
          </div>
        </div>

        {/* Undo Send */}
        <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80 space-y-3">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
            <Undo2 className="w-4 h-4 text-[#0078d4]" />
            <span>Undo Send Delay</span>
          </h3>
          <p className="text-neutral-500 text-[11px]">Messages are held in the outbox briefly after you press Send, giving you time to cancel.</p>
          <div className="flex items-center gap-4">
            {[0, 5, 10].map((sec) => (
              <label key={sec} className="flex items-center gap-1.5 cursor-pointer text-neutral-700 dark:text-neutral-300">
                <input
                  type="radio"
                  name="undoSendDelay"
                  checked={form.undoSendDelaySeconds === sec}
                  onChange={() => setForm({ ...form, undoSendDelaySeconds: sec })}
                  className="accent-[#0078d4]"
                />
                <span>{sec === 0 ? 'Disabled' : `${sec} seconds`}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ShieldAlert, Check } from 'lucide-react';
import { useToastStore } from '@/stores';

export function JunkSettingsView() {
  const [blocked, setBlocked] = useState<string[]>([
    'spammer@marketing-blast.com',
    'promo@unsolicited-deals.net',
  ]);
  const [safe, setSafe] = useState<string[]>([
    'talent@hackajob.com',
    'noreply@thalesgroup.com',
    'mullayam06@outlook.com',
  ]);
  const [newBlocked, setNewBlocked] = useState('');
  const [newSafe, setNewSafe] = useState('');
  const addToast = useToastStore((s) => s.addToast);

  const handleAddBlocked = () => {
    if (!newBlocked.trim() || blocked.includes(newBlocked.trim())) return;
    setBlocked((prev) => [...prev, newBlocked.trim()]);
    setNewBlocked('');
    addToast({ title: 'Sender blocked', description: 'Emails will be sent to Junk.', type: 'info' });
  };

  const handleRemoveBlocked = (email: string) => {
    setBlocked((prev) => prev.filter((b) => b !== email));
    addToast({ title: 'Unblocked sender', type: 'info' });
  };

  const handleAddSafe = () => {
    if (!newSafe.trim() || safe.includes(newSafe.trim())) return;
    setSafe((prev) => [...prev, newSafe.trim()]);
    setNewSafe('');
    addToast({ title: 'Safe sender added', description: 'Emails will never be sent to Junk.', type: 'success' });
  };

  const handleRemoveSafe = (email: string) => {
    setSafe((prev) => prev.filter((s) => s !== email));
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Junk email</h2>
        <p className="text-neutral-500 mt-0.5">Control which email senders are automatically blocked or marked as trusted.</p>
      </div>

      {/* Blocked senders */}
      <div className="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c]">
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Blocked senders and domains</h3>
          <p className="text-[11px] text-neutral-500">Messages from these addresses will be automatically moved to your Junk Email folder.</p>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="e.g. spammer@domain.com"
            value={newBlocked}
            onChange={(e) => setNewBlocked(e.target.value)}
            className="h-8 px-2.5 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs flex-1"
          />
          <button
            onClick={handleAddBlocked}
            className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /><span>Add</span>
          </button>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded divide-y divide-neutral-200 dark:divide-neutral-800 max-h-40 overflow-y-auto">
          {blocked.map((item) => (
            <div key={item} className="p-2 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#222222]">
              <span>{item}</span>
              <button onClick={() => handleRemoveBlocked(item)} className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Safe senders */}
      <div className="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c]">
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Safe senders and domains</h3>
          <p className="text-[11px] text-neutral-500">Don't move email from these senders to my Junk Email folder.</p>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="e.g. colleague@trusted.com"
            value={newSafe}
            onChange={(e) => setNewSafe(e.target.value)}
            className="h-8 px-2.5 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs flex-1"
          />
          <button
            onClick={handleAddSafe}
            className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /><span>Add</span>
          </button>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded divide-y divide-neutral-200 dark:divide-neutral-800 max-h-40 overflow-y-auto">
          {safe.map((item) => (
            <div key={item} className="p-2 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#222222]">
              <span>{item}</span>
              <button onClick={() => handleRemoveSafe(item)} className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

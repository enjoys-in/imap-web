'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';

export function AboutSettingsBrandingCard() {
  const addToast = useToastStore((s) => s.addToast);
  const [checking, setChecking] = useState(false);

  const handleCheckUpdates = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      addToast({
        title: 'You are up to date',
        description: 'AirSend Webmail v2.4.0-rc1 is currently the latest build.',
        type: 'success',
      });
    }, 800);
  };

  return (
    <div className="space-y-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0078d4] to-[#50e6ff] flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
          AS
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>AirSend Mail & Calendar</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0078d4]/10 text-[#0078d4] font-semibold">
              v2.4.0-rc1
            </span>
          </h3>
          <p className="text-neutral-500 text-[11px]">
            Modern Outlook-Class Webmail, IMAP/SMTP Real-Time Synchronizer & Calendar Engine.
          </p>
          <p className="text-neutral-400 text-[10px]">
            Build ID: 2026.11.14-release &bull; Storage: Multi-Engine TTL (Memory, Redis, RocksDB)
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleCheckUpdates}
          disabled={checking}
          className="px-3 py-1.5 rounded bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking for updates...' : 'Check for updates'}</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline, cachedEmailsCount } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white px-3 py-1.5 text-xs font-medium flex items-center justify-between shrink-0 select-none shadow-sm animate-in slide-in-from-top-1">
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
        <span>Working Offline — You are disconnected from the network.</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] bg-black/15 px-2 py-0.5 rounded-full">
        <Database className="w-3 h-3" />
        <span>IndexedDB Cache: {cachedEmailsCount} messages available</span>
      </div>
    </div>
  );
}

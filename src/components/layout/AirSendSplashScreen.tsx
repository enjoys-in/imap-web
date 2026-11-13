'use client';

import React from 'react';
import { Send } from 'lucide-react';

interface AirSendSplashScreenProps {
  statusMessage?: string;
}

export function AirSendSplashScreen({
  statusMessage = 'Connecting to mailbox...',
}: AirSendSplashScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-neutral-950 select-none overflow-hidden">
      {/* Background Skeleton Wireframe */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none flex flex-col p-4 gap-3">
        <div className="h-10 bg-neutral-900 rounded-md w-full animate-pulse" />
        <div className="flex-1 flex gap-3">
          <div className="w-48 bg-neutral-900 rounded-md animate-pulse" />
          <div className="w-80 bg-neutral-900 rounded-md animate-pulse" />
          <div className="flex-1 bg-neutral-900 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Floating Animated Brand Logo & Status */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0078d4] via-[#0086e8] to-[#00b4d8] shadow-xl shadow-blue-500/25 flex items-center justify-center text-white animate-bounce [animation-duration:2.5s]">
            <Send className="w-8 h-8 stroke-[2.2] translate-x-0.5 -translate-y-0.5" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-[#0078d4]/20 animate-ping -z-10 [animation-duration:2s]" />
          <div className="absolute -inset-4 rounded-3xl bg-[#0078d4]/10 animate-pulse -z-20" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-1">
          AirSend
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-medium">
          Modern Web Mail & Productivity
        </p>

        {/* Shimmering Progress Bar */}
        <div className="w-52 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mb-3.5 relative">
          <div className="h-full bg-gradient-to-r from-[#0078d4] via-[#38bdf8] to-[#0078d4] rounded-full animate-[progress_1.2s_ease-in-out_infinite]" />
        </div>

        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
          {statusMessage}
        </span>
      </div>
    </div>
  );
}

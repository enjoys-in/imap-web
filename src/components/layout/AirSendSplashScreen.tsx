'use client';

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { AirSend3DRibbon } from '../auth/AirSend3DRibbon';
import { FluentBloomBackground } from '../auth/FluentBloomBackground';
import { FluentCard } from '../ui/fluent/FluentCard';

interface AirSendSplashScreenProps {
  statusMessage?: string;
}

/**
 * Windows 11 Fluent UI Splash & Loading Screen
 * Features the signature 3D twisting ribbon brand mark, Fluent bloom backdrop,
 * acrylic glass card, and authentic indeterminate progress bar.
 */
export function AirSendSplashScreen({
  statusMessage = 'Connecting to mailbox...',
}: AirSendSplashScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center select-none overflow-hidden font-sans">
      {/* ──────────────── Windows 11 Fluent Blue Silk Backdrop ──────────────── */}
      <FluentBloomBackground />

      {/* ──────────────── Background Outlook Wireframe Outline ──────────────── */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.035] pointer-events-none flex flex-col p-3 gap-2 z-0">
        {/* Top Header Bar Wireframe */}
        <div className="h-11 bg-white dark:bg-neutral-100 rounded-xl w-full flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-neutral-400" />
            <div className="w-24 h-4 rounded bg-neutral-400" />
          </div>
          <div className="w-72 h-7 rounded-lg bg-neutral-400" />
          <div className="w-8 h-8 rounded-full bg-neutral-400" />
        </div>

        {/* Workspace Panes Wireframe */}
        <div className="flex-1 flex gap-2">
          {/* Left App Switcher Rail */}
          <div className="w-12 bg-white dark:bg-neutral-100 rounded-xl flex flex-col items-center py-4 gap-4">
            <div className="w-6 h-6 rounded bg-neutral-400" />
            <div className="w-6 h-6 rounded bg-neutral-400" />
            <div className="w-6 h-6 rounded bg-neutral-400" />
          </div>

          {/* Folder Tree Sidebar */}
          <div className="w-56 bg-white dark:bg-neutral-100 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="w-full h-8 rounded-lg bg-neutral-400" />
            <div className="w-3/4 h-5 rounded bg-neutral-400" />
            <div className="w-5/6 h-5 rounded bg-neutral-400" />
            <div className="w-2/3 h-5 rounded bg-neutral-400" />
          </div>

          {/* Message List Pane */}
          <div className="w-80 md:w-96 bg-white dark:bg-neutral-100 rounded-xl p-3 flex flex-col gap-3">
            <div className="w-full h-7 rounded bg-neutral-400" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-2 space-y-1.5 border-b border-neutral-300 dark:border-neutral-700">
                <div className="w-1/2 h-4 rounded bg-neutral-400" />
                <div className="w-3/4 h-3.5 rounded bg-neutral-400" />
                <div className="w-full h-3 rounded bg-neutral-400" />
              </div>
            ))}
          </div>

          {/* Reading Pane */}
          <div className="flex-1 bg-white dark:bg-neutral-100 rounded-xl p-6 flex flex-col gap-4">
            <div className="w-1/2 h-7 rounded bg-neutral-400" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-400" />
              <div className="space-y-1.5">
                <div className="w-32 h-4 rounded bg-neutral-400" />
                <div className="w-48 h-3 rounded bg-neutral-400" />
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <div className="w-full h-3.5 rounded bg-neutral-400" />
              <div className="w-full h-3.5 rounded bg-neutral-400" />
              <div className="w-4/5 h-3.5 rounded bg-neutral-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── Center Fluent Mica / Acrylic Glass Card ──────────────── */}
      <div className="relative z-10 w-full max-w-sm px-4 animate-in fade-in zoom-in-95 duration-300">
        <FluentCard className="flex flex-col items-center text-center p-8 sm:p-10 shadow-2xl">
          {/* Floating 3D Windows 11 Ribbon Mark */}
          <div className="mb-4">
            <AirSend3DRibbon className="w-20 h-20" />
          </div>

          {/* Brand Typography */}
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>AirSend</span>
              <Sparkles className="w-4 h-4 text-[#0078d4] dark:text-blue-400 inline" />
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Fluent Mail & Productivity
            </p>
          </div>

          {/* Windows 11 Indeterminate Fluent Progress Bar */}
          <div className="w-60 h-2 bg-neutral-200/90 dark:bg-neutral-800/90 rounded-full overflow-hidden mb-4 relative shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0078d4] via-[#38bdf8] to-[#0078d4] animate-[progress_1.4s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[progress_1.4s_ease-in-out_infinite]" />
          </div>

          {/* Fluent Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-[11px] font-medium text-blue-900 dark:text-blue-200 max-w-full">
            <span className="w-2 h-2 rounded-full bg-[#0078d4] dark:bg-blue-400 animate-pulse shrink-0" />
            <span className="truncate">{statusMessage}</span>
          </div>

          {/* Security Footnote */}
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500 mt-5 pt-3 border-t border-neutral-200/50 dark:border-neutral-800/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Encrypted Session • TLS 1.3 Verified</span>
          </div>
        </FluentCard>
      </div>
    </div>
  );
}

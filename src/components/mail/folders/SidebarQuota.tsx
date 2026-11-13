'use client';

import React from 'react';
import Link from 'next/link';
import { HardDrive, ArrowUpRight } from 'lucide-react';

interface SidebarQuotaProps {
  usedMb?: number;
  totalMb?: number;
}

export function SidebarQuota({
  usedMb = 4235,
  totalMb = 15360,
}: SidebarQuotaProps) {
  const pct = Math.round((usedMb / totalMb) * 100);
  const usedGb = (usedMb / 1024).toFixed(1);
  const totalGb = (totalMb / 1024).toFixed(0);

  // Determine color theme for percentage badge based on threshold
  const badgeColor =
    pct > 75
      ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-300 dark:border-red-800'
      : pct > 50
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300 dark:border-orange-800'
      : pct > 25
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  return (
    <div className="p-2.5 border-t border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/80 dark:bg-[#191919]/60 shrink-0 select-none transition-colors">
      <Link
        href="/settings/accounts/storage"
        title="Manage Mailbox Quota & Storage"
        className="group block space-y-2 cursor-pointer"
      >
        {/* Top Header: Title, Icon, and Percentage Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 group-hover:text-[#0078d4] dark:group-hover:text-blue-400 transition-colors">
            <HardDrive className="w-3.5 h-3.5 text-[#0078d4] shrink-0" />
            <span className="font-semibold text-xs tracking-tight">Quota</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none ${badgeColor}`}
            >
              {pct}%
            </span>
            <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-[#0078d4] dark:group-hover:text-blue-400 transition-colors" />
          </div>
        </div>

        {/* Used and Total capacity */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
          <span>{usedGb} GB used</span>
          <span className="text-neutral-400 dark:text-neutral-500 font-mono text-[10px]">
            of {totalGb} GB
          </span>
        </div>

        {/* Gradient Progress Bar: Green (0-25%) -> Yellow (25-50%) -> Orange (50-75%) -> Red (75-100%) */}
        <div className="relative w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-300/40 dark:border-neutral-700/40">
          <div
            className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
            style={{
              width: `${pct}%`,
              background:
                'linear-gradient(90deg, #10b981 0%, #84cc16 25%, #eab308 50%, #f97316 75%, #ef4444 100%)',
            }}
          />
          {/* Subtle tick markers for 25%, 50%, 75% */}
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-white/40 dark:bg-black/40" />
            <span className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-white/40 dark:bg-black/40" />
            <span className="absolute top-0 bottom-0 left-[75%] w-[1px] bg-white/40 dark:bg-black/40" />
          </div>
        </div>

        {/* 25%, 50%, 75%, 100% threshold indicators */}
        <div className="flex justify-between items-center text-[9px] font-mono select-none pt-0.5">
          <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
            25%
          </span>
          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
            <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
            50%
          </span>
          <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
            <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
            75%
          </span>
          <span className="flex items-center gap-0.5 text-red-600 dark:text-red-400">
            <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
            100%
          </span>
        </div>
      </Link>
    </div>
  );
}

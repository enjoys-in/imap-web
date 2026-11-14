'use client';

import React from 'react';
import Link from 'next/link';
import { HardDrive } from 'lucide-react';
import { useQuota } from '@/hooks/useEmailsQuery';

interface SidebarQuotaProps {
  usedMb?: number;
  totalMb?: number;
}

export const QUOTA_FULL_GRADIENT =
  'linear-gradient(90deg, #10b981 0%, #84cc16 25%, #eab308 50%, #f97316 75%, #ef4444 100%)';

export function getQuotaBarColor(pct: number): string {
  if (pct >= 90) return 'linear-gradient(90deg, #f97316, #ef4444)';
  if (pct >= 75) return 'linear-gradient(90deg, #eab308, #f97316)';
  if (pct >= 50) return 'linear-gradient(90deg, #10b981, #eab308)';
  if (pct >= 25) return 'linear-gradient(90deg, #10b981, #84cc16)';
  return '#10b981';
}

export function SidebarQuota({
  usedMb: propUsedMb,
  totalMb: propTotalMb,
}: SidebarQuotaProps) {
  const { data: quota } = useQuota();

  const realUsedMb = typeof quota?.storage?.used === 'number' ? Math.round(quota.storage.used / (1024 * 1024)) : undefined;
  const realTotalMb = quota?.storage?.limit ? Math.round(quota.storage.limit / (1024 * 1024)) : undefined;

  const usedMb = propUsedMb ?? realUsedMb;
  const totalMb = propTotalMb ?? realTotalMb;

  if (usedMb === undefined || !totalMb) return null;

  const pct = quota?.storage?.percentage !== undefined
    ? Math.round(quota.storage.percentage)
    : Math.min(100, Math.max(0, Math.round((usedMb / totalMb) * 100)));

  const usedGb = (usedMb / 1024).toFixed(1);
  const totalGb = (totalMb / 1024).toFixed(0);

  // Determine badge color theme based on threshold
  const badgeColor =
    pct > 75
      ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-300 dark:border-red-800'
      : pct > 50
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border-orange-300 dark:border-orange-800'
      : pct > 25
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

  return (
    <div className="p-3 border-t border-neutral-200 dark:border-neutral-800/80 bg-transparent shrink-0 select-none">
      <Link
        href="/settings/accounts/storage"
        title="Manage Mailbox Storage"
        className="group block space-y-1.5 cursor-pointer"
      >
        {/* Header: Icon, Label, and Percentage Badge */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 group-hover:text-[#0078d4] dark:group-hover:text-blue-400 transition-colors font-medium">
            <HardDrive className="w-3.5 h-3.5 text-[#0078d4] shrink-0" />
            <span>Quota</span>
          </div>
          <span
            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none ${badgeColor}`}
          >
            {pct}%
          </span>
        </div>

        {/* Minimized Height Progress Bar (Full-track gradient revealed proportionally without premature red) */}
        <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
            style={{ width: `${pct}%` }}
          >
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${pct > 0 ? (100 / pct) * 100 : 100}%`,
                background: QUOTA_FULL_GRADIENT,
              }}
            />
          </div>
        </div>

        {/* Used and Total Capacity */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
          <span>{usedGb} GB used</span>
          <span>of {totalGb} GB</span>
        </div>
      </Link>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { Truck, Package, Copy, Check, ExternalLink, X, ArrowUpRight } from 'lucide-react';
import { detectPackageTracking, DetectedPackage } from '@/lib/trackingParser';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

interface ReadingPanePackageTrackerProps {
  emailId: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
}

export function ReadingPanePackageTracker({
  emailId,
  subject,
  bodyText,
  bodyHtml,
}: ReadingPanePackageTrackerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const pkg = useMemo<DetectedPackage | null>(() => {
    return detectPackageTracking(subject, bodyText, bodyHtml);
  }, [subject, bodyText, bodyHtml]);

  if (!pkg || isDismissed) return null;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(pkg.trackingNumber);
      }
      setCopied(true);
      addToast({
        title: 'Tracking number copied',
        description: `Copied ${pkg.trackingNumber} to clipboard`,
        type: 'success',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast({
        title: 'Copy failed',
        description: 'Unable to access clipboard.',
        type: 'error',
      });
    }
  };

  return (
    <div className="mx-4 my-2.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-r from-sky-50/90 via-cyan-50/50 to-neutral-50 dark:from-sky-950/40 dark:via-cyan-950/30 dark:to-neutral-900/60 p-3.5 shadow-xs transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Carrier Icon & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-600 dark:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-sky-100 dark:ring-sky-950/70">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {pkg.carrierName}
              </span>
              {pkg.status && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border',
                    pkg.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : pkg.status === 'Out for Delivery'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  )}
                >
                  <Package className="w-3 h-3" />
                  {pkg.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                Tracking: {pkg.trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy tracking number"
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer p-0.5"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Track Button & Dismiss */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <a
            href={pkg.trackingUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="px-3.5 py-1.5 h-8 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Track Package</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            title="Dismiss tracker"
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { ShieldAlert, ExternalLink, X, AlertOctagon } from 'lucide-react';
import { detectPhishingLinks, SuspiciousLink } from '@/lib/phishingDetector';

interface ReadingPanePhishingBannerProps {
  emailId: string;
  bodyHtml?: string;
}

export function ReadingPanePhishingBanner({ emailId, bodyHtml }: ReadingPanePhishingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const suspicious = useMemo<SuspiciousLink | null>(() => {
    return detectPhishingLinks(bodyHtml);
  }, [bodyHtml]);

  if (!suspicious || isDismissed) return null;

  return (
    <div className="mx-4 my-2.5 p-3.5 rounded-xl border border-red-300 dark:border-red-900/80 bg-gradient-to-r from-red-50/95 via-rose-50/70 to-neutral-50 dark:from-red-950/50 dark:via-rose-950/30 dark:to-neutral-900/70 shadow-xs text-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 dark:bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-red-100 dark:ring-red-950/70 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-900 dark:text-red-200">
                Security Warning: Deceptive Link Detected
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                Phishing Risk
              </span>
            </div>

            <p className="text-[11px] text-neutral-700 dark:text-neutral-300">
              {suspicious.reason}
            </p>

            <div className="p-2 rounded bg-white/80 dark:bg-neutral-800/80 border border-red-200/60 dark:border-red-900/40 text-[11px] font-mono break-all text-neutral-800 dark:text-neutral-200">
              <span className="text-neutral-400 font-sans">Destination: </span>
              {suspicious.actualUrl}
            </div>

            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Never enter account passwords or personal payment information on unverified sites.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          title="Dismiss warning"
          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

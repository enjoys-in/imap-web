'use client';

import React from 'react';
import { AboutSettingsBrandingCard } from './about/AboutSettingsBrandingCard';
import { AboutSettingsDiagnosticsCard } from './about/AboutSettingsDiagnosticsCard';

export function AboutSettingsView() {
  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none pb-12">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b]">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          About & Diagnostics
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Application version, live IMAP/SMTP connection status, server extensions, and jobs.
        </p>
      </div>

      <AboutSettingsBrandingCard />
      <AboutSettingsDiagnosticsCard />
    </div>
  );
}

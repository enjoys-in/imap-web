'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { MailMessage, MailMessageMetadata } from '@/types';

interface ReadingPaneHeaderDetailsProps {
  email: MailMessage | MailMessageMetadata;
  formattedDate: string;
}

export function ReadingPaneHeaderDetails({ email, formattedDate }: ReadingPaneHeaderDetailsProps) {
  return (
    <div className="mt-3 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#222222] text-xs space-y-1.5 animate-in fade-in duration-100">
      <div className="flex items-center justify-between text-neutral-500 text-[11px] pb-1 border-b border-neutral-200 dark:border-neutral-800">
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Message Headers & Recipients</span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SPF & DKIM Verified</span>
        </span>
      </div>

      <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 text-neutral-700 dark:text-neutral-300 pt-0.5">
        <span className="text-neutral-500 font-medium">From:</span>
        <span className="font-mono text-[11px]">{email.fromName} &lt;{email.fromAddress}&gt;</span>

        <span className="text-neutral-500 font-medium">To:</span>
        <span className="font-mono text-[11px]">{email.to}</span>

        {email.cc && (
          <>
            <span className="text-neutral-500 font-medium">Cc:</span>
            <span className="font-mono text-[11px] text-[#0078d4]">{email.cc}</span>
          </>
        )}

        {email.bcc && (
          <>
            <span className="text-neutral-500 font-medium">Bcc:</span>
            <span className="font-mono text-[11px] text-neutral-400">{email.bcc}</span>
          </>
        )}

        <span className="text-neutral-500 font-medium">Date:</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}

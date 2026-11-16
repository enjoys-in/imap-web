'use client';

import React, { useState, useMemo } from 'react';
import { Hourglass, CornerUpLeft, X, Send } from 'lucide-react';
import { detectAwaitingReply, FollowUpStatus } from '@/lib/followUpDetector';
import { MailMessage, MailMessageMetadata } from '@/types';
import { useComposeStore } from '@/stores';

interface ReadingPaneFollowUpBannerProps {
  email: MailMessage | MailMessageMetadata;
  myEmails: string[];
}

export function ReadingPaneFollowUpBanner({ email, myEmails }: ReadingPaneFollowUpBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const openReply = useComposeStore((s) => s.openReply);

  const status = useMemo<FollowUpStatus | null>(() => {
    return detectAwaitingReply(email, myEmails);
  }, [email, myEmails]);

  if (!status || isDismissed) return null;

  const handleSendFollowUp = () => {
    openReply(email, false);
    setTimeout(() => {
      const currentBody = useComposeStore.getState().body;
      const followUpText = `Hi ${email.to?.split('@')[0] || 'there'},\n\nJust following up on my previous note below to see if you had a chance to review. Looking forward to hearing from you!\n\nThanks,\n`;
      useComposeStore.setState({
        body: `${followUpText}\n--- Original Message ---\n${currentBody}`,
      });
    }, 50);
  };

  return (
    <div className="mx-4 my-2 px-3.5 py-2.5 rounded-xl border border-amber-200/90 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-neutral-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-neutral-900/60 flex items-center justify-between gap-3 text-xs shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Hourglass className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950 dark:text-amber-200">
              Waiting for Reply
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
              Sent {status.daysAgo} days ago
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            You sent this message asking a question and haven&apos;t received a response yet.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleSendFollowUp}
          className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
          <span>Send Follow-up</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          title="Dismiss reminder"
          className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

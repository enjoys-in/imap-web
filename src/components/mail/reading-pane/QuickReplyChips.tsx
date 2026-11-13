'use client';

import React from 'react';
import { CornerUpLeft, Sparkles } from 'lucide-react';
import { MailMessage, MailMessageMetadata } from '@/types';
import { useComposeStore } from '@/stores';

interface QuickReplyChipsProps {
  email: MailMessage | MailMessageMetadata;
}

const QUICK_REPLIES = [
  'Sounds good, thank you!',
  "I've reviewed this and approve.",
  'Could you share more details on this?',
  'Let me review and get back to you shortly.',
];

export function QuickReplyChips({ email }: QuickReplyChipsProps) {
  const openReply = useComposeStore((s) => s.openReply);
  const updateFields = useComposeStore((s) => s.updateFields);

  const handleChipClick = (replyText: string) => {
    openReply(email, false);
    setTimeout(() => {
      updateFields({
        body: `${replyText}\n\n---\nOn ${new Date(email.date).toLocaleDateString()}, ${email.fromName} wrote:\n> ${email.preview}`,
      });
    }, 50);
  };

  return (
    <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium mb-1.5">
        <Sparkles className="w-3 h-3 text-[#0078d4]" />
        <span>Quick Reply:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_REPLIES.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => handleChipClick(text)}
            className="px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-[#222222] hover:border-[#0078d4] hover:text-[#0078d4] text-neutral-700 dark:text-neutral-300 text-xs font-normal transition-all shadow-2xs hover:shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <CornerUpLeft className="w-3 h-3 opacity-60" />
            <span>{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

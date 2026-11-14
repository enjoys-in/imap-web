import React from 'react';
import { Paperclip } from 'lucide-react';
import { MailMessage, MailMessageMetadata } from '@/types';
import { cn } from '@/lib/utils';

interface MailListItemWideRowProps {
  email: MailMessageMetadata | MailMessage;
  dateFormatted: string;
  hasThread: boolean;
}

export function MailListItemWideRow({ email, dateFormatted, hasThread }: MailListItemWideRowProps) {
  return (
    <div className="flex-1 flex items-center gap-3 min-w-0 py-0.5">
      <div className="w-48 sm:w-64 shrink-0 flex items-center gap-1.5 min-w-0">
        <span
          className={cn(
            'truncate text-xs',
            !email.isRead ? 'font-bold text-neutral-900 dark:text-white' : 'font-semibold text-neutral-700 dark:text-neutral-300'
          )}
        >
          {email.fromName || email.fromAddress}
        </span>
        {hasThread && email.threadCount && email.threadCount > 1 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shrink-0">
            {email.threadCount}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2 truncate">
        <span
          className={cn(
            'text-xs truncate shrink-0 max-w-[40%]',
            !email.isRead ? 'font-bold text-neutral-900 dark:text-white' : 'font-medium text-neutral-800 dark:text-neutral-200'
          )}
        >
          {email.subject || '(No subject)'}
        </span>
        <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{email.preview}</span>
        {email.hasAttachments && <Paperclip className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-auto" />}
      </div>

      <div className="w-24 shrink-0 text-right text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
        {dateFormatted}
      </div>
    </div>
  );
}

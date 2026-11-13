'use client';

import { MailMessage, MailMessageMetadata } from '@/types';

export type MailActionType =
  | 'delete'
  | 'archive'
  | 'move-to'
  | 'report-junk'
  | 'report-phishing'
  | 'snooze'
  | 'reply'
  | 'reply-all'
  | 'forward'
  | 'toggle-read'
  | 'mark-read'
  | 'mark-unread'
  | 'toggle-flag'
  | 'toggle-pin'
  | 'undo'
  | 'deselect';

export interface MailActionEventDetail {
  action: MailActionType;
  /** Optional specific target email or email ID (if omitted, listener falls back to active selection or selectedMailId in store) */
  targetEmailId?: string;
  targetEmail?: MailMessage | MailMessageMetadata | null;
  /** Additional arguments such as target folder ID and display name */
  folderId?: string;
  folderName?: string;
  /** Snooze duration or date string */
  snoozeUntil?: string;
}

export const MAIL_ACTION_EVENT = 'airsend:mail-action';

/**
 * Dispatches a mail action event that will be captured by the central mail action listener.
 */
export function dispatchMailAction(detail: MailActionEventDetail): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<MailActionEventDetail>(MAIL_ACTION_EVENT, { detail })
    );
  }
}

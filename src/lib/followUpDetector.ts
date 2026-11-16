/**
 * Detects whether an email or thread is awaiting a response from the recipient.
 */

import { differenceInDays } from 'date-fns';
import { MailMessage, MailMessageMetadata } from '@/types';

const QUESTION_PATTERNS = [
  /\b(?:let\s+me\s+know|let\s+us\s+know)\b/i,
  /\b(?:could\s+you\s+please|can\s+you\s+please|would\s+you\s+mind)\b/i,
  /\b(?:waiting\s+for\s+your|looking\s+forward\s+to\s+your\s+response)\b/i,
  /\b(?:any\s+updates?\s+on|any\s+news\s+on)\b/i,
  /\b(?:please\s+confirm|please\s+advise|please\s+reply)\b/i,
  /\b(?:what\s+do\s+you\s+think|thoughts\?)\b/i,
  /\?/,
];

export interface FollowUpStatus {
  isAwaitingReply: boolean;
  daysAgo: number;
  snippet?: string;
}

export function detectAwaitingReply(
  email: MailMessage | MailMessageMetadata,
  myEmails: string[]
): FollowUpStatus | null {
  const senderEmail = email.fromAddress?.toLowerCase().trim();
  const isSentByMe = myEmails.some((e) => e.toLowerCase().trim() === senderEmail);

  // If the last email was not sent by me, then we are not waiting for a reply from someone else
  if (!isSentByMe) return null;

  const emailDate = new Date(email.date);
  if (isNaN(emailDate.getTime())) return null;

  const daysAgo = differenceInDays(new Date(), emailDate);
  // Suggest follow-up if sent at least 2 days ago
  if (daysAgo < 2) return null;

  const body = 'bodyText' in email ? email.bodyText || '' : email.preview || '';
  const containsQuestion = QUESTION_PATTERNS.some((pat) => pat.test(body) || pat.test(email.subject));

  if (!containsQuestion) return null;

  return {
    isAwaitingReply: true,
    daysAgo,
    snippet: body.slice(0, 100),
  };
}

import { MailMessage, MailMessageMetadata } from '@/types';
import { MOCK_BODIES_MAP } from './mockBodies';
import { generateAdditionalInboxEmails } from './mockEmailList';

function createMeta(
  id: string,
  accountId: string,
  subject: string,
  fromName: string,
  fromAddress: string,
  to: string,
  date: string,
  preview: string,
  extra: Partial<MailMessageMetadata> = {}
): MailMessageMetadata {
  const isThread = extra.isThread ?? Boolean(extra.threadCount && extra.threadCount > 1);
  return {
    id,
    folderId: 'fld-inbox',
    accountId,
    uid: 200 + parseInt(id.replace(/\D/g, '') || '1', 10),
    threadId: extra.threadId || `thread-${id}`,
    subject,
    fromName,
    fromAddress,
    to,
    date,
    size: 14200,
    preview,
    isRead: false,
    isFlagged: false,
    isPinned: false,
    isAnswered: false,
    isForwarded: false,
    isDraft: false,
    isThread,
    conversationType: isThread ? 'thread' : 'single',
    hasAttachments: false,
    hasCalendar: false,
    isBodyDownloaded: true,
    ...extra,
  };
}

export const MOCK_EMAILS_METADATA: MailMessageMetadata[] = [
  // Account 0: mullayam06@outlook.com (acc-1)
  createMeta('msg-phil-kell', 'acc-1', 'Senior Full-Stack Opportunities at hackajob', 'Phil Kell', 'phil@hackajob.com', 'mullayam06@outlook.com', '2026-11-13T12:11:00.000Z', 'Hi Mulayam, Hope you are well. I came across your profile and wanted to reach out...', { cc: 'talent@hackajob.com', bcc: 'archive@hackajob.com' }),
  createMeta('msg-whitekraaft', 'acc-1', 'Opportunities with Orqohire', 'Whitekraaft Recruitment', 'recruitment@whitekraaft.com', 'mullayam06@outlook.com', '2026-10-29T16:31:00.000Z', '"WALK-IN DRIVE – HYDERABAD & AHMEDABAD"...', { isPinned: true }),
  createMeta('msg-gaurav', 'acc-1', 'Avelix Private Limited: Independent Cont...', 'Gaurav Raj', 'gaurav.raj@avelix.com', 'mullayam06@outlook.com', '2026-11-10T17:24:00.000Z', 'Dear Mulayam, Further to our discussions, we are...', { isThread: true, threadCount: 3, threadId: 'thread-gaurav' }),
  createMeta('msg-jeelan', 'acc-1', 'JD - Full-Stack Application Engineer - S...', 'Jeelan Basha Shaik', 'jeelan.shaik@recruitment.com', 'mullayam06@outlook.com', '2026-11-09T11:22:00.000Z', 'Hi Mulayam, please find the attached JD for your...', { hasAttachments: true, isAnswered: true }),
  createMeta('msg-candidate-outreach', 'acc-1', 'Career Check in: Are you exploring now rol...', 'candidate-outreach@o6ai.com', 'candidate-outreach@o6ai.com', 'mullayam06@outlook.com', '2026-11-09T14:15:00.000Z', "Hi Mullayam06, I hope you're doing well! I'm reaching out from the candidate talent team at o6ai...", { isThread: true, threadCount: 2, threadId: 'thread-candidate-outreach' }),
  createMeta('msg-thales', 'acc-1', 'Thales - Application Update', 'Thales Group', 'noreply@thalesgroup.com', 'mullayam06@outlook.com', '2026-11-08T10:10:00.000Z', 'Hello Mulayam, I wanted to provide you with an...', { isRead: true }),
  createMeta('msg-honeywell', 'acc-1', 'New job opportunities at Honeywell', 'Human Resources', 'hr-talent@honeywell.com', 'mullayam06@outlook.com', '2026-11-08T09:40:00.000Z', 'Hello Mullayam, We have new jobs that might interest...', { isRead: true }),
  createMeta('msg-oracle', 'acc-1', 'Your latest Oracle jobs', 'Oracle Talent Acquisition', 'talent-no-reply@oracle.com', 'mullayam06@outlook.com', '2026-11-02T08:00:00.000Z', 'Hello Mulayam, Welcome to your Oracle jobs update...', { isRead: true }),

  // Account 1: mulayam@oraczen.ai (acc-2)
  createMeta('msg-oraczen-1', 'acc-2', 'Welcome to Oraczen AI Runtime Platform', 'Oraczen Engineering', 'platform@oraczen.ai', 'mulayam@oraczen.ai', '2026-11-13T09:00:00.000Z', 'Welcome to Oraczen AI. Your developer environment and compute...', { isPinned: true }),
  createMeta('msg-oraczen-2', 'acc-2', 'Sprint 14: Agent Protocol & Multi-Tenancy Architecture', 'Sarah Lin', 'sarah.lin@oraczen.ai', 'mulayam@oraczen.ai', '2026-11-12T14:30:00.000Z', 'Hi Mulayam, Sprint 14 review is scheduled for tomorrow at 3:00 PM IST...', { hasAttachments: true }),

  // Account 2: mulayam@unosend.co (acc-3)
  createMeta('msg-unosend-1', 'acc-3', 'UnoSend Service Alert: High Deliverability Report', 'UnoSend Operations', 'ops@unosend.co', 'mulayam@unosend.co', '2026-11-13T06:15:00.000Z', 'UnoSend Service Alert: SMTP transmission health is 99.98% across pools...', { isPinned: true }),

  // Account 3: mullayam06@airsend.in (acc-4)
  createMeta('msg-airsend-1', 'acc-4', 'AirSend Mailbox Initialized Successfully', 'AirSend System', 'system@airsend.in', 'mullayam06@airsend.in', '2026-11-13T08:00:00.000Z', 'Welcome to AirSend. Your modern, privacy-first web mail client is synchronized...', { isPinned: true }),

  // Notes in fld-notes
  createMeta('note-smtp-config', 'acc-1', 'SMTP Server Config & Ports', 'AirSend Notes', 'notes@airsend.in', 'mullayam06@outlook.com', '2026-11-13T10:00:00.000Z', 'Host: mail.enjoys.in | Port: 587 | User: mullayam06@airsend.in | Security: STARTTLS...', { folderId: 'fld-notes', isPinned: true }),
  createMeta('note-sprint-review', 'acc-1', 'Meeting Notes: Sprint Review', 'AirSend Notes', 'notes@airsend.in', 'mullayam06@outlook.com', '2026-11-12T16:30:00.000Z', 'Key focus for next release: Multi-account tab isolation, Real-time background sync...', { folderId: 'fld-notes', isPinned: true }),
  createMeta('note-imap-commands', 'acc-1', 'IMAP Protocol Reference & RFC Standards', 'AirSend Notes', 'notes@airsend.in', 'mullayam06@outlook.com', '2026-11-11T14:15:00.000Z', 'Standard flags: \\Seen, \\Answered, \\Flagged, \\Deleted, \\Draft. Commands: UID FETCH, IDLE...', { folderId: 'fld-notes' }),
  // Additional generated inbox batch
  ...generateAdditionalInboxEmails(),
];

export const MOCK_THREAD_SUB_MESSAGES: Record<string, MailMessageMetadata[]> = {
  'thread-gaurav': [
    createMeta('msg-gaurav-child-1', 'acc-1', 'Re: Avelix Private Limited: Independent Cont...', 'Mulayam S', 'mullayam06@outlook.com', 'gaurav.raj@avelix.com', '2026-11-09T15:20:00.000Z', "I'm Extremely Sorry I have shared mistakenly a different document.", { threadId: 'thread-gaurav', isThread: true, conversationType: 'thread', isAnswered: true }),
    createMeta('msg-gaurav-child-2', 'acc-1', 'Re: Avelix Private Limited: Independent Cont...', 'Gaurav Raj', 'gaurav.raj@avelix.com', 'mullayam06@outlook.com', '2026-11-08T12:00:00.000Z', 'Hi Mulayam, Thanks for the opportunity. I have attached all the...', { threadId: 'thread-gaurav', isThread: true, conversationType: 'thread' }),
  ],
  'thread-candidate-outreach': [
    createMeta('msg-candidate-outreach-child-1', 'acc-1', 'Re: Career Check in: Are you exploring now rol...', 'candidate-outreach@o6ai.com', 'candidate-outreach@o6ai.com', 'mullayam06@outlook.com', '2026-11-08T11:00:00.000Z', 'Just following up on my previous note regarding open engineering roles...', { threadId: 'thread-candidate-outreach', isThread: true, conversationType: 'thread' }),
  ],
};

const allSubMeta: MailMessageMetadata[] = Object.values(MOCK_THREAD_SUB_MESSAGES).flat();
export const MOCK_ALL_METADATA: MailMessageMetadata[] = [...MOCK_EMAILS_METADATA, ...allSubMeta];

export const MOCK_EMAILS: MailMessage[] = MOCK_ALL_METADATA.map((meta) => ({
  ...meta,
  bodyHtml: MOCK_BODIES_MAP[meta.id]?.bodyHtml || `<p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.6;">${meta.preview}</p>`,
  bodyText: MOCK_BODIES_MAP[meta.id]?.bodyText || meta.preview,
}));

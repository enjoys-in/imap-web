import { MailMessageMetadata } from '@/types';

export function generateAdditionalInboxEmails(): MailMessageMetadata[] {
  const SENDER_TEMPLATES = [
    { name: 'GitHub Notifications', from: 'notifications@github.com', subj: 'Security Advisory: Dependency update required in imap-web', size: 18400 },
    { name: 'Linear App', from: 'updates@linear.app', subj: 'AIR-142: Real-time draft auto-sync assigned to you', size: 9200 },
    { name: 'Vercel Deployment', from: 'notifications@vercel.com', subj: 'Production deployment successful: airsend-web (main branch)', size: 12100 },
    { name: 'Atlassian Jira', from: 'jira@contoso.atlassian.net', subj: '[JIRA] Issue verified: Calendar week grid time indicator aligned', size: 24500 },
    { name: 'Stripe Billing', from: 'invoices@stripe.com', subj: 'Your monthly invoice for AirSend Pro Cloud Mailbox', size: 45000, hasAttachments: true },
    { name: 'AWS Notifications', from: 'no-reply-aws@amazon.com', subj: 'Amazon SES Notification: Identity verification status confirmed', size: 15600 },
    { name: 'Google Cloud Platform', from: 'google-cloud-compliance@google.com', subj: 'Monthly billing summary: AI Studio & Cloud Run workloads', size: 28900, hasAttachments: true },
    { name: 'GitLab Security', from: 'security@gitlab.com', subj: 'Weekly Security Digest: Automated container scans completed', size: 14700 },
    { name: 'Figma Team', from: 'community@figma.com', subj: 'Design Review: Studio Calendar Schedule component kit updated', size: 31200 },
    { name: 'Postman Team', from: 'news@postman.com', subj: 'Your API Collection: IMAP-API contract tests published', size: 11800 },
  ];

  const now = new Date('2026-11-14T00:10:00.000Z').getTime();
  const list: MailMessageMetadata[] = [];

  for (let i = 1; i <= 50; i++) {
    const tmpl = SENDER_TEMPLATES[(i - 1) % SENDER_TEMPLATES.length];
    // Dates decreasing: latest first!
    const dateMs = now - (i * 3.5 * 3600 * 1000); // spaced out by a few hours each
    const dateIso = new Date(dateMs).toISOString();

    list.push({
      id: `msg-batch-${i}`,
      folderId: 'fld-inbox',
      accountId: 'acc-1',
      uid: 500 + i,
      threadId: `thread-batch-${i}`,
      subject: `${tmpl.subj} #${i}`,
      fromName: tmpl.name,
      fromAddress: tmpl.from,
      to: 'mullayam06@outlook.com',
      date: dateIso,
      size: tmpl.size + (i * 120),
      preview: `Notification details for ${tmpl.subj}. Please check your active dashboard for updates and logs...`,
      isRead: i > 5, // Top 5 are unread
      isFlagged: i % 7 === 0,
      isPinned: false,
      isAnswered: false,
      isForwarded: false,
      isDraft: false,
      isThread: false,
      conversationType: 'single',
      hasAttachments: Boolean(tmpl.hasAttachments || i % 6 === 0),
      hasCalendar: false,
      isBodyDownloaded: true,
    });
  }

  return list;
}

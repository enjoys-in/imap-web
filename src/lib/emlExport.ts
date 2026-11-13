import { MailMessage, MailMessageMetadata } from '@/types';

export function exportEmailToEml(email: MailMessage | MailMessageMetadata, bodyHtml?: string, bodyText?: string) {
  const content = [
    `From: "${email.fromName || email.fromAddress}" <${email.fromAddress}>`,
    `To: <${email.to}>`,
    `Subject: ${email.subject || '(No subject)'}`,
    `Date: ${new Date(email.date).toUTCString()}`,
    `MIME-Version: 1.0`,
    `Message-ID: <${email.id}@airsend.imap>`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    bodyHtml || (email as any).bodyHtml || `<p>${(bodyText || email.preview || '').replace(/\n/g, '<br/>')}</p>`,
  ].join('\r\n');

  const blob = new Blob([content], { type: 'message/rfc822' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const safeSubject = (email.subject || 'message').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  anchor.download = `${safeSubject}.eml`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

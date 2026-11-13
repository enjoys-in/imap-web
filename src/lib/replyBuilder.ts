import { MailMessage, MailMessageMetadata } from '@/types';

export type ComposeMode = 'new' | 'reply' | 'replyAll' | 'forward' | 'editDraft';

export interface ComposeSeed {
  to: string;
  cc: string;
  bcc?: string;
  subject: string;
  body: string;
  inReplyTo?: string | null;
  references?: string | null;
}

const SEPARATOR = '________________________________';

export function prefixSubject(prefix: string, subject: string): string {
  const s = subject.trim();
  return s.toLowerCase().startsWith(prefix.toLowerCase()) ? s : `${prefix} ${s}`;
}

export function formatAddress(name: string, email: string): string {
  return name.trim() ? `${name} <${email}>` : email;
}

export function quoteHeader(msg: MailMessageMetadata | MailMessage): string {
  const sentDate = new Date(msg.date).toLocaleString();
  const fromDisplay = formatAddress(msg.fromName, msg.fromAddress);
  const lines = [
    SEPARATOR,
    `From: ${fromDisplay}`,
    `Sent: ${sentDate}`,
    `To: ${msg.to}`,
  ];
  if (msg.cc) lines.push(`Cc: ${msg.cc}`);
  lines.push(`Subject: ${msg.subject}`, '');
  return lines.join('\n');
}

export function buildComposeSeed(
  mode: ComposeMode,
  original?: MailMessageMetadata | MailMessage | null,
  myEmail = '',
  signature = ''
): ComposeSeed {
  const signText = signature.trim() ? `\n\n${signature.trim()}` : '';

  if (!original || mode === 'new') {
    return { to: '', cc: '', subject: '', body: signText, inReplyTo: null, references: null };
  }

  const origBody =
    'bodyText' in original && original.bodyText
      ? original.bodyText
      : original.preview || '';
  if (mode === 'editDraft') {
    return {
      to: original.to,
      cc: original.cc || '',
      bcc: original.bcc || '',
      subject: original.subject,
      body: origBody,
      inReplyTo: original.inReplyTo,
      references: original.references,
    };
  }

  const quoted = `${signText}\n\n${quoteHeader(original)}\n${origBody}`;
  const refs = [original.references, original.messageIdHeader].filter(Boolean).join(' ').trim() || null;

  if (mode === 'forward') {
    return {
      to: '',
      cc: '',
      subject: prefixSubject('FW:', original.subject),
      body: quoted,
      inReplyTo: null,
      references: refs,
    };
  }

  const replyTarget = original.replyTo || formatAddress(original.fromName, original.fromAddress);

  if (mode === 'reply') {
    return {
      to: replyTarget,
      cc: '',
      subject: prefixSubject('RE:', original.subject),
      body: quoted,
      inReplyTo: original.messageIdHeader || null,
      references: refs,
    };
  }

  // ReplyAll
  const me = myEmail.toLowerCase();
  const allTo = [replyTarget, ...(original.to?.split(',') || [])]
    .map((s) => s.trim())
    .filter((s) => s && !s.toLowerCase().includes(me));

  return {
    to: Array.from(new Set(allTo)).join(', '),
    cc: original.cc || '',
    subject: prefixSubject('RE:', original.subject),
    body: quoted,
    inReplyTo: original.messageIdHeader || null,
    references: refs,
  };
}

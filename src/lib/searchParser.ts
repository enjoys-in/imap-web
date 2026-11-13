import { MailMessage, MailMessageMetadata } from '@/types';

export interface ParsedEmailFilter {
  raw: string;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  hasAttachment?: boolean;
  fileName?: string;
  isRead?: boolean;
  isFlagged?: boolean;
  isPinned?: boolean;
  freeTerms: string[];
}

export interface SearchOperatorHint {
  label: string;
  prefix: string;
  example: string;
  description: string;
}

export const SEARCH_OPERATOR_HINTS: SearchOperatorHint[] = [
  { label: 'From sender', prefix: 'from:', example: 'from:alex', description: 'Sender name or address' },
  { label: 'To recipient', prefix: 'to:', example: 'to:sarah@example.com', description: 'Recipient address' },
  { label: 'Subject line', prefix: 'subject:', example: 'subject:"quarterly review"', description: 'Words in subject' },
  { label: 'Has file attachment', prefix: 'has:attachment', example: 'has:attachment', description: 'Emails with attached files' },
  { label: 'Attachment file name', prefix: 'file:', example: 'file:pdf', description: 'Specific attachment name or extension' },
  { label: 'Unread emails', prefix: 'is:unread', example: 'is:unread', description: 'Only unread messages' },
  { label: 'Flagged / Starred', prefix: 'is:flagged', example: 'is:flagged', description: 'Starred or flagged messages' },
  { label: 'Message body', prefix: 'body:', example: 'body:"budget proposal"', description: 'Words in message body' },
];

/**
 * Parses user search query string into structured operators and free-text terms.
 */
export function parseEmailSearchQuery(queryString: string): ParsedEmailFilter {
  const query = queryString.trim();
  const filter: ParsedEmailFilter = {
    raw: query,
    freeTerms: [],
  };

  if (!query) return filter;

  // Regex matches operator:value or operator:"quoted value"
  const operatorRegex =
    /(?:(from|to|cc|bcc|subject|body|has|is|file|attachment):(?:"([^"]+)"|(\S+)))/gi;

  let match: RegExpExecArray | null;
  let remaining = query;

  while ((match = operatorRegex.exec(query)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] !== undefined ? match[2] : match[3];

    switch (key) {
      case 'from':
        filter.from = val.toLowerCase();
        break;
      case 'to':
        filter.to = val.toLowerCase();
        break;
      case 'subject':
        filter.subject = val.toLowerCase();
        break;
      case 'body':
        filter.body = val.toLowerCase();
        break;
      case 'has':
        if (val.toLowerCase() === 'attachment' || val.toLowerCase() === 'file') {
          filter.hasAttachment = true;
        }
        break;
      case 'file':
      case 'attachment':
        filter.hasAttachment = true;
        filter.fileName = val.toLowerCase();
        break;
      case 'is':
        if (val.toLowerCase() === 'unread') {
          filter.isRead = false;
        } else if (val.toLowerCase() === 'read' || val.toLowerCase() === 'seen') {
          filter.isRead = true;
        } else if (val.toLowerCase() === 'flagged' || val.toLowerCase() === 'starred') {
          filter.isFlagged = true;
        } else if (val.toLowerCase() === 'pinned') {
          filter.isPinned = true;
        }
        break;
    }

    remaining = remaining.replace(match[0], ' ');
  }

  // Free terms after operators are extracted
  filter.freeTerms = remaining
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  return filter;
}

/**
 * Performs fuzzy multi-token evaluation against an email message metadata or full message.
 */
export function matchesEmailFilter(
  email: MailMessageMetadata | MailMessage,
  filter: ParsedEmailFilter
): boolean {
  if (!filter.raw) return true;

  // Operator check: from
  if (filter.from) {
    const fromName = (email.fromName || '').toLowerCase();
    const fromAddr = (email.fromAddress || '').toLowerCase();
    if (!fromName.includes(filter.from) && !fromAddr.includes(filter.from)) {
      return false;
    }
  }

  // Operator check: to
  if (filter.to) {
    const toStr = (email.to || '').toLowerCase();
    if (!toStr.includes(filter.to)) {
      return false;
    }
  }

  // Operator check: subject
  if (filter.subject) {
    const subject = (email.subject || '').toLowerCase();
    if (!subject.includes(filter.subject)) {
      return false;
    }
  }

  // Operator check: body
  if (filter.body) {
    const preview = (email.preview || '').toLowerCase();
    const bodyText = 'bodyText' in email ? (email.bodyText || '').toLowerCase() : '';
    if (!preview.includes(filter.body) && !bodyText.includes(filter.body)) {
      return false;
    }
  }

  // Operator check: hasAttachment
  if (filter.hasAttachment !== undefined) {
    const hasAtt =
      email.hasAttachments || ('attachments' in email && Array.isArray((email as any).attachments) && (email as any).attachments.length > 0);
    if (filter.hasAttachment && !hasAtt) return false;
  }

  // Operator check: fileName / attachment name
  if (filter.fileName) {
    const attachments = (email as any).attachments;
    if (Array.isArray(attachments)) {
      const matchFile = attachments.some((att: any) =>
        (att.filename || '').toLowerCase().includes(filter.fileName!)
      );
      if (!matchFile) return false;
    } else if (!email.hasAttachments) {
      return false;
    }
  }

  // Operator check: isRead
  if (filter.isRead !== undefined && email.isRead !== filter.isRead) {
    return false;
  }

  // Operator check: isFlagged
  if (filter.isFlagged !== undefined && email.isFlagged !== filter.isFlagged) {
    return false;
  }

  // Operator check: isPinned
  if (filter.isPinned !== undefined && email.isPinned !== filter.isPinned) {
    return false;
  }

  // Free-text multi-token fuzzy matching
  if (filter.freeTerms.length > 0) {
    const subject = (email.subject || '').toLowerCase();
    const fromName = (email.fromName || '').toLowerCase();
    const fromAddr = (email.fromAddress || '').toLowerCase();
    const toStr = (email.to || '').toLowerCase();
    const preview = (email.preview || '').toLowerCase();

    // Check attachment filenames if available
    const attNames =
      'attachments' in email && Array.isArray((email as any).attachments)
        ? (email as any).attachments.map((a: any) => (a.filename || '').toLowerCase()).join(' ')
        : '';

    const combinedSearchable = `${subject} ${fromName} ${fromAddr} ${toStr} ${preview} ${attNames}`;

    // Every token must match somewhere in the email metadata
    for (const token of filter.freeTerms) {
      if (!combinedSearchable.includes(token)) {
        return false;
      }
    }
  }

  return true;
}

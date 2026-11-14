import type { OutgoingAttachment } from '@/types';

const CRLF = '\r\n';
const BASE64_LINE_LENGTH = 76;
const TEXT_PART_HEADERS = [
  'Content-Type: text/plain; charset=utf-8',
  'Content-Transfer-Encoding: base64',
];

export interface RawMessageParts {
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  bodyText: string;
  attachments?: readonly OutgoingAttachment[];
}

const isAscii = (value: string): boolean => /^[\x20-\x7e]*$/.test(value);

function utf8ToBase64(value: string): string {
  let binary = '';
  new TextEncoder().encode(value).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function wrapBase64(content: string): string {
  return content.match(new RegExp(`.{1,${BASE64_LINE_LENGTH}}`, 'g'))?.join(CRLF) ?? '';
}

function encodeHeaderValue(value: string): string {
  return isAscii(value) ? value : `=?UTF-8?B?${utf8ToBase64(value)}?=`;
}

function encodeExtendedValue(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function attachmentHeaders(attachment: OutgoingAttachment): string[] {
  const asciiName = attachment.filename.replace(/[^\x20-\x7e]|["\\]/g, '_');
  return [
    `Content-Type: ${attachment.contentType}; name="${asciiName}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${asciiName}"; filename*=UTF-8''${encodeExtendedValue(attachment.filename)}`,
  ];
}

function createBoundary(): string {
  return `=_airsend_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function buildRawMessage({
  to,
  cc,
  bcc,
  subject,
  bodyText,
  attachments = [],
}: RawMessageParts): string {
  const headers = [
    to ? `To: ${to}` : null,
    cc ? `Cc: ${cc}` : null,
    bcc ? `Bcc: ${bcc}` : null,
    `Subject: ${encodeHeaderValue(subject ?? '')}`,
    'MIME-Version: 1.0',
  ].filter((header): header is string => header !== null);

  const textBody = wrapBase64(utf8ToBase64(bodyText));

  if (attachments.length === 0) {
    return [...headers, ...TEXT_PART_HEADERS, '', textBody].join(CRLF);
  }

  const boundary = createBoundary();
  const parts = [
    [...TEXT_PART_HEADERS, '', textBody],
    ...attachments.map((attachment) => [
      ...attachmentHeaders(attachment),
      '',
      wrapBase64(attachment.content),
    ]),
  ];

  return [
    ...headers,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    parts.map((part) => [`--${boundary}`, ...part].join(CRLF)).join(CRLF),
    `--${boundary}--`,
    '',
  ].join(CRLF);
}

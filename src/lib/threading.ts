const REPLY_PREFIXES = ['re', 'fw', 'fwd', 'aw', 'tr', 'sv'];

export function normalizeSubject(subject: string): string {
  let s = subject.trim();
  while (true) {
    const colon = s.indexOf(':');
    if (colon <= 0 || colon > 4) break;
    const prefix = s.slice(0, colon).trim().toLowerCase();
    if (!REPLY_PREFIXES.includes(prefix)) break;
    s = s.slice(colon + 1).trimStart();
  }
  return s.toLowerCase();
}

function firstId(header?: string | null): string | null {
  if (!header?.trim()) return null;
  const first = header.split(/[\s,\t\r\n]+/).filter(Boolean)[0];
  if (!first) return null;
  return first.trim().replace(/^<|>$/g, '').toLowerCase();
}

export function resolveThreadId(
  messageId?: string | null,
  inReplyTo?: string | null,
  references?: string | null,
  subject = ''
): string {
  const root =
    firstId(references) ||
    firstId(inReplyTo) ||
    (messageId ? messageId.trim().replace(/^<|>$/g, '').toLowerCase() : null);

  if (root) return root;
  return `subject:${normalizeSubject(subject)}`;
}

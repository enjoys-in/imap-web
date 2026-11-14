/**
 * Recipient display utilities
 * Formats "To:" / "Cc:" strings to show "You" or "You, other emails" when the current user is a recipient.
 */

export function extractBareEmail(recipient: string): string {
  if (!recipient) return '';
  const match = recipient.match(/<([^>]+)>/);
  if (match) return match[1].trim().toLowerCase();
  return recipient.trim().toLowerCase();
}

export function getUserEmails(
  activeEmail?: string | null,
  allAccounts?: { email: string }[]
): string[] {
  const list = new Set<string>();
  if (activeEmail && activeEmail.trim()) {
    list.add(activeEmail.trim().toLowerCase());
  }
  if (allAccounts) {
    for (const a of allAccounts) {
      if (a.email && a.email.trim()) {
        list.add(a.email.trim().toLowerCase());
      }
    }
  }
  return Array.from(list);
}

/**
 * If `to` basically contains my email then show "You" and if others then "You, other emails".
 */
export function formatRecipientsWithYou(
  toRaw: string | undefined | null,
  myEmails: string | (string | undefined | null)[]
): string {
  if (!toRaw || !toRaw.trim()) return '';

  const cleanRaw = toRaw.replace(/^To:\s*/i, '').trim();
  if (!cleanRaw) return '';

  const myEmailList: string[] = (Array.isArray(myEmails) ? myEmails : [myEmails])
    .filter((e): e is string => Boolean(e && e.trim()))
    .map((e) => extractBareEmail(e));

  const parts = cleanRaw
    .split(/[,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return cleanRaw;

  let containsMyEmail = false;
  const otherRecipients: string[] = [];

  for (const part of parts) {
    const bare = extractBareEmail(part);
    const isMe = myEmailList.some((my) => my === bare);
    if (isMe) {
      containsMyEmail = true;
    } else {
      otherRecipients.push(part);
    }
  }

  if (containsMyEmail) {
    if (otherRecipients.length === 0) {
      return 'You';
    }
    return `You, ${otherRecipients.join(', ')}`;
  }

  return parts.join(', ');
}

/**
 * Utility to detect if an email draft mentions attachments while none are actually attached.
 */

const ATTACHMENT_KEYWORDS = [
  /\b(?:see|find|check|view)\s+(?:the\s+)?attached\b/i,
  /\b(?:i(?:'ve| have)?\s+attached)\b/i,
  /\b(?:attached\s+(?:is|are|please\s+find|herewith|file|document|pdf|image|screenshot|presentation|sheet|deck|invoice|receipt|contract))\b/i,
  /\b(?:please\s+find\s+attached)\b/i,
  /\b(?:enclosed\s+(?:is|are|please\s+find|herewith|file|document))\b/i,
  /\b(?:attachment(?:s)?\s+(?:is|are|included|here))\b/i,
  /\b(?:sending\s+(?:you\s+)?(?:the\s+)?attachment)\b/i,
  /\b(?:in\s+the\s+attachment(?:s)?)\b/i,
];

export function hasAttachmentReference(subject?: string, body?: string): boolean {
  const combined = `${subject || ''} ${body || ''}`;
  return ATTACHMENT_KEYWORDS.some((rx) => rx.test(combined));
}

export function shouldWarnMissingAttachment(
  subject: string,
  body: string,
  attachmentCount: number
): boolean {
  if (attachmentCount > 0) return false;
  return hasAttachmentReference(subject, body);
}

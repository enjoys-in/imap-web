/**
 * Parser for detecting newsletter / promotional unsubscribe mechanisms in emails.
 */

export interface DetectedUnsubscribe {
  type: 'http' | 'mailto';
  target: string;
  senderName: string;
}

export function detectUnsubscribe(
  fromAddress?: string,
  fromName?: string,
  bodyHtml?: string,
  bodyText?: string
): DetectedUnsubscribe | null {
  const sender = fromName || fromAddress || 'this sender';

  // 1. Check for mailto: unsubscribe links in HTML or Text
  const mailtoMatch = (bodyHtml || bodyText || '').match(
    /href=["'](mailto:[^"']*(?:subject=[^"']*unsubscribe[^"']*|unsubscribe@[^"']*))["']/i
  ) || (bodyText || '').match(/\b(mailto:[^\s]*(?:unsubscribe)[^\s]*)\b/i);

  if (mailtoMatch && mailtoMatch[1]) {
    return {
      type: 'mailto',
      target: mailtoMatch[1],
      senderName: sender,
    };
  }

  // 2. Check for explicit http(s) unsubscribe anchor tags
  if (bodyHtml) {
    const anchorMatch = bodyHtml.match(
      /<a\b[^>]*href=["'](https?:\/\/[^"']*(?:unsubscribe|optout|opt-out|manage-preferences|email-preferences|subscription)[^"']*)["'][^>]*>(.*?)<\/a>/i
    );
    if (anchorMatch && anchorMatch[1]) {
      return {
        type: 'http',
        target: anchorMatch[1],
        senderName: sender,
      };
    }
  }

  // 3. Check for plaintext URLs with unsubscribe keywords
  if (bodyText) {
    const textUrlMatch = bodyText.match(
      /\b(https?:\/\/[^\s<>"')]+(?:unsubscribe|optout|opt-out|email-preferences)[^\s<>"')]*)/i
    );
    if (textUrlMatch && textUrlMatch[1]) {
      return {
        type: 'http',
        target: textUrlMatch[1],
        senderName: sender,
      };
    }
  }

  return null;
}

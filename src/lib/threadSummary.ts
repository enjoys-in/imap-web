/**
 * Rule-based heuristic extractor for Thread TL;DR Summary and Action Items.
 */

export interface ThreadSummaryResult {
  summaryPoints: string[];
  actionItems: string[];
}

const ACTION_PATTERNS = [
  /\b(?:will|shall)\s+(?:prepare|send|update|review|follow up|create|deploy|complete|share|check|fix|schedule|finalize)\b/i,
  /\b(?:need to|needs to|please ensure|please make sure|please send|please review|action item(?:s)?)\b/i,
  /\b(?:deadline\s+is|due\s+by|target\s+is|by\s+(?:monday|tuesday|wednesday|thursday|friday|tomorrow|eod|end of day))\b/i,
  /\b(?:assigned to|tasked with|taking care of|responsible for)\b/i,
  /\b(?:don't forget to|remember to|next steps?)\b/i,
];

const EXCLUDE_PATTERNS = [
  /unsubscribe/i,
  /privacy policy/i,
  /all rights reserved/i,
  /confidentiality notice/i,
  /this message was sent to/i,
  /view in browser/i,
];

function cleanRawText(html?: string, text?: string): string {
  if (text && text.trim().length > 30) return text;
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractThreadSummary(
  subject?: string,
  bodyText?: string,
  bodyHtml?: string
): ThreadSummaryResult | null {
  const content = cleanRawText(bodyHtml, bodyText);
  if (!content || content.length < 100) return null;

  // Split into sentences
  const rawSentences = content
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 300);

  const cleanSentences = rawSentences.filter(
    (s) => !EXCLUDE_PATTERNS.some((pat) => pat.test(s))
  );

  if (cleanSentences.length < 2) return null;

  const actionItems: string[] = [];
  const summaryPoints: string[] = [];

  for (const sentence of cleanSentences) {
    const isAction = ACTION_PATTERNS.some((rx) => rx.test(sentence));
    if (isAction && actionItems.length < 4) {
      actionItems.push(sentence);
    } else if (summaryPoints.length < 3 && !summaryPoints.includes(sentence)) {
      summaryPoints.push(sentence);
    }
  }

  // Ensure we have meaningful points
  if (summaryPoints.length === 0 && actionItems.length === 0) {
    return null;
  }

  // Fallback first sentences if summary is too short
  if (summaryPoints.length === 0 && cleanSentences.length > 0) {
    summaryPoints.push(cleanSentences[0]);
  }

  return {
    summaryPoints,
    actionItems,
  };
}

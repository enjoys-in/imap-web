import { getRegisteredFolder } from '@/lib/folders';
import type { MailMessage } from '@/types';

export function isDraftMessage(message: Pick<MailMessage, 'isDraft' | 'folderId'>): boolean {
  return message.isDraft || getRegisteredFolder(message.folderId)?.special === 'Drafts';
}

export function htmlToPlainText(html: string): string {
  if (!html) return '';
  const normalized = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n');
  const doc = new DOMParser().parseFromString(normalized, 'text/html');
  return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}

interface DraftBodySource {
  bodyText?: string;
  bodyHtml?: string;
}

export function resolveDraftBody(source: DraftBodySource | null | undefined): string {
  if (!source) return '';
  return source.bodyText?.trim() ? source.bodyText : htmlToPlainText(source.bodyHtml ?? '');
}

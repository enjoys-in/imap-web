import DOMPurify from 'dompurify';

export interface SanitizeOptions {
  allowExternalImages?: boolean;
}

export function sanitizeEmailHtml(html: string, options: SanitizeOptions = {}): string {
  if (!html) return '';
  if (typeof window === 'undefined') {
    return html;
  }

  const clean = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: false,
    ALLOWED_TAGS: [
      'a', 'b', 'blockquote', 'br', 'div', 'em', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub',
      'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul'
    ],
    ALLOWED_ATTR: [
      'align', 'alt', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'cite', 'class',
      'color', 'colspan', 'dir', 'face', 'height', 'href', 'id', 'rowspan', 'size', 'src',
      'style', 'target', 'title', 'valign', 'width'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|blob|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  if (!options.allowExternalImages) {
    // Replace remote http/https image src with placeholder
    return clean.replace(
      /<img\s+([^>]*?)src=["'](https?:\/\/[^"']+)["']([^>]*?)>/gi,
      '<img $1src="data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'24\'><text y=\'16\' fill=\'%23888\' font-size=\'12\'>[Image Blocked]</text></svg>" data-blocked-src="$2"$3>'
    );
  }

  return clean;
}

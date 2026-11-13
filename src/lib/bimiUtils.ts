export function getDomainFromEmail(email: string): string {
  if (!email) return '';
  const clean = email.replace(/.*<([^>]+)>.*/, '$1').trim();
  const parts = clean.split('@');
  return parts.length > 1 ? parts[1].toLowerCase().trim() : '';
}

const GENERIC_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'aol.com',
  'mail.com',
  'zoho.com',
  'protonmail.com',
]);

const KNOWN_BRAND_LOGOS: Record<string, string> = {
  'oracle.com': 'https://www.google.com/s2/favicons?domain=oracle.com&sz=128',
  'thalesgroup.com': 'https://www.google.com/s2/favicons?domain=thalesgroup.com&sz=128',
  'microsoft.com': 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
  'google.com': 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
  'github.com': 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
  'linkedin.com': 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=128',
  'hackajob.com': 'https://www.google.com/s2/favicons?domain=hackajob.com&sz=128',
  'airsend.in': '/icon.svg',
};

/**
 * Returns BIMI / domain brand logo URL if available, or null for personal provider emails.
 */
export function getBimiLogoUrl(email: string, explicitLogo?: string): string | null {
  if (explicitLogo) return explicitLogo;
  const domain = getDomainFromEmail(email);
  if (!domain || GENERIC_EMAIL_PROVIDERS.has(domain)) {
    return null;
  }
  if (KNOWN_BRAND_LOGOS[domain]) {
    return KNOWN_BRAND_LOGOS[domain];
  }
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/**
 * Phishing and deceptive link analyzer for email HTML and plaintext content.
 */

export interface SuspiciousLink {
  displayText: string;
  actualUrl: string;
  reason: string;
}

export function detectPhishingLinks(html?: string): SuspiciousLink | null {
  if (!html) return null;

  // Find all <a href="...">...</a> tags
  const linkRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    const actualUrl = match[1].trim();
    const rawDisplayText = match[2].replace(/<[^>]+>/g, '').trim();

    // Skip mailto, tel, anchor hashes, javascript
    if (!actualUrl.startsWith('http://') && !actualUrl.startsWith('https://')) {
      continue;
    }

    try {
      const parsedActual = new URL(actualUrl);
      const actualHost = parsedActual.hostname.toLowerCase();

      // 1. IP address in hostname (e.g. http://192.168.1.50/login)
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(actualHost)) {
        return {
          displayText: rawDisplayText || actualUrl,
          actualUrl,
          reason: 'Link points directly to an IP address instead of a verified domain name.',
        };
      }

      // 2. Punycode / Homograph domain attack (xn--)
      if (actualHost.includes('xn--')) {
        return {
          displayText: rawDisplayText || actualUrl,
          actualUrl,
          reason: 'Domain contains encoded Punycode characters often used in homograph impersonation.',
        };
      }

      // 3. Display text looks like a domain or URL, but points to a completely different domain
      const looksLikeUrl =
        /^(?:https?:\/\/)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)/i.exec(rawDisplayText);

      if (looksLikeUrl) {
        const displayedHost = looksLikeUrl[1].toLowerCase().replace(/^www\./, '');
        const actualCleanHost = actualHost.replace(/^www\./, '');

        if (displayedHost && actualCleanHost && displayedHost !== actualCleanHost) {
          // Check if actual host is not simply a subdomain of displayed host
          if (!actualCleanHost.endsWith(`.${displayedHost}`)) {
            return {
              displayText: rawDisplayText,
              actualUrl,
              reason: `Link text shows "${displayedHost}", but actually routes to a different domain "${actualCleanHost}".`,
            };
          }
        }
      }

      // 4. Deceptive credential harvesting subdomains (e.g. paypal.com.attacker.xyz)
      const majorBrands = ['paypal', 'apple', 'microsoft', 'google', 'netflix', 'amazon', 'chase', 'bankofamerica'];
      for (const brand of majorBrands) {
        if (
          actualHost.includes(brand) &&
          !actualHost.endsWith(`${brand}.com`) &&
          !actualHost.endsWith(`${brand}.net`)
        ) {
          return {
            displayText: rawDisplayText || actualUrl,
            actualUrl,
            reason: `Domain name mimics "${brand}" but does not belong to the official service domain.`,
          };
        }
      }
    } catch {
      // Invalid URL syntax
    }
  }

  return null;
}

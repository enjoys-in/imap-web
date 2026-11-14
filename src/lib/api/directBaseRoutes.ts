/**
 * Route paths that are mounted directly on the server's base URL (root),
 * rather than under the versioned API prefix (apiUrl).
 * These routes implement RFC / Outlook / Thunderbird public discovery standards:
 * - router.get/post: ["/autodiscover", "/Autodiscover", "/autodiscover.json", "/autodiscover.xml"]
 * - router.get/post: ["/autodiscover/autodiscover.xml", "/Autodiscover/Autodiscover.xml"]
 * - router.get: ["/mail/config-v1.1.xml", "/.well-known/autoconfig/mail/config-v1.1.xml"]
 */
export const DIRECT_BASE_URL_ROUTES = [
  '/autodiscover',
  '/Autodiscover',
  '/autodiscover.json',
  '/autodiscover.xml',
  '/autodiscover/autodiscover.xml',
  '/Autodiscover/Autodiscover.xml',
  '/mail/config-v1.1.xml',
  '/.well-known/autoconfig/mail/config-v1.1.xml',
] as const;

/**
 * Checks if a given endpoint string (with or without query parameters)
 * matches any of the direct base URL autodiscover/autoconfig routes.
 */
export function isDirectBaseUrlRoute(endpoint: string): boolean {
  if (!endpoint) return false;
  const path = (endpoint.split('?')[0] || '').split('#')[0].trim();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const lower = normalized.toLowerCase();

  return DIRECT_BASE_URL_ROUTES.some((route) => {
    return normalized === route || lower === route.toLowerCase();
  });
}

/**
 * Resolves the full URL for an endpoint, using baseUrl for root discovery routes
 * and apiUrl for standard backend API endpoints.
 */
export function resolveEndpointUrl(
  endpoint: string,
  config: { baseUrl?: string; apiUrl: string }
): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const cleanBaseUrl = (config.baseUrl || 'http://localhost:9503').replace(/\/+$/, '');
  const cleanApiUrl = config.apiUrl.replace(/\/+$/, '');
  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const hostUrl = isDirectBaseUrlRoute(normalized) ? cleanBaseUrl : cleanApiUrl;
  return `${hostUrl}${normalized}`;
}

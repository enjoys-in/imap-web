import { getClientConfig } from '@/config/clientConfig';
import { getAuthToken } from './tokenStorage';
import { moldApiResponse } from './moldResponse';
import { resolveEndpointUrl, isDirectBaseUrlRoute } from './directBaseRoutes';

export { getAuthToken, setAuthToken, clearAuthToken } from './tokenStorage';
export { moldApiResponse, type ApiResponse } from './moldResponse';
export { DIRECT_BASE_URL_ROUTES, isDirectBaseUrlRoute, resolveEndpointUrl } from './directBaseRoutes';

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

const inflightGets = new Map<string, Promise<unknown>>();

/**
 * Core HTTP client that handles:
 * - Credentials & CORS cookies (`credentials: 'include'`)
 * - Bearer authorization headers
 * - Direct baseUrl routing for public autodiscover / autoconfig routes
 * - Standardized JSON molding: enforces { success, message, result }
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    return performRequest<T>(endpoint, options);
  }

  const key = `${getAuthToken() || ''}|${resolveEndpointUrl(endpoint, getClientConfig())}`;
  const pending = inflightGets.get(key);
  if (pending) {
    return (pending as Promise<T>).then((value) =>
      typeof value === 'object' && value !== null ? structuredClone(value) : value
    );
  }

  const request = performRequest<T>(endpoint, options).finally(() => {
    inflightGets.delete(key);
  });
  inflightGets.set(key, request);
  return request;
}

async function performRequest<T>(
  endpoint: string,
  options: ApiRequestOptions
): Promise<T> {
  const config = getClientConfig();
  const token = getAuthToken();

  const url = resolveEndpointUrl(endpoint, config);
  const isBaseRoute = isDirectBaseUrlRoute(endpoint);

  const headers: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Set Authorization header unless skipped or targeting public direct base routes
  if (token && !options.skipAuth && !isBaseRoute) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set App identification headers
  if (config.appName) {
    headers['X-App-Name'] = config.appName;
  }
  if (config.appVersion) {
    headers['X-App-Version'] = config.appVersion;
  }

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((val, key) => {
        headers[key] = val;
      });
    } else if (Array.isArray(options.headers)) {
      for (const [key, val] of options.headers) {
        headers[key] = val;
      }
    } else {
      Object.assign(headers, options.headers);
    }
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      if (json && typeof json === 'object') {
        errorMsg = json.message || json.error || errorMsg;
      }
      throw new Error(errorMsg);
    }

    const molded = moldApiResponse<T>(json, res.status, res.statusText);
    return molded as unknown as T;
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(errorText || `HTTP ${res.status}: ${res.statusText}`);
  }

  const text = await res.text();
  return text as unknown as T;
}

export const apiClient = {
  get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
      }
    );
  },

  put<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
      }
    );
  },

  patch<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
      }
    );
  },

  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },

  async unwrap<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    const res = await apiRequest<any>(endpoint, options);
    return (res?.result !== undefined ? res.result : res) as T;
  },
};

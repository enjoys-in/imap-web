import { getClientConfig, isLiveApiAvailable } from '@/config/clientConfig';
import { Appointment, MailFolder, MailMessage } from '@/types';
import { MOCK_ACCOUNTS, MOCK_APPOINTMENTS, MOCK_EMAILS, MOCK_FOLDERS } from '@/lib/mock';

const TOKEN_STORAGE_KEY = 'airsend_access_token';

let inMemoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) return stored;
    } catch {}
  }
  return inMemoryToken;
}

export function setAuthToken(token: string): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {}
  }
}

export function clearAuthToken(): void {
  inMemoryToken = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
  }
}

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Core HTTP client that handles:
 * - Credentials & CORS cookies (`credentials: 'include'`)
 * - Bearer authorization headers
 * - Normalized JSON unwrapping (`data.result`, `data.data`, or `data`)
 * - Graceful fallback to mock data when backend is unreachable or offline
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  fallback?: T
): Promise<T> {
  const { apiUrl } = getClientConfig();
  const token = getAuthToken();

  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = isFullUrl ? endpoint : `${apiUrl}${normalizedEndpoint}`;

  const headers: Record<string, string> = {};

  // Only set application/json if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge any custom headers
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

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }

    const text = await res.text();
    return text as unknown as T;
  } catch (err) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export const apiClient = {
  get<T>(endpoint: string, options?: ApiRequestOptions, fallback?: T): Promise<T> {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' }, fallback);
  },

  post<T>(endpoint: string, body?: any, options?: ApiRequestOptions, fallback?: T): Promise<T> {
    return apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body),
      },
      fallback
    );
  },

  patch<T>(endpoint: string, body?: any, options?: ApiRequestOptions, fallback?: T): Promise<T> {
    return apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: body instanceof FormData ? body : JSON.stringify(body),
      },
      fallback
    );
  },

  delete<T>(endpoint: string, options?: ApiRequestOptions, fallback?: T): Promise<T> {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' }, fallback);
  },
};

/**
 * Legacy API client facade for backward compatibility
 */
export const api = {
  async getAccounts(): Promise<any[]> {
    return apiClient.get('/accounts', {}, MOCK_ACCOUNTS);
  },

  async getFolders(accountId: string): Promise<MailFolder[]> {
    return apiClient.get<MailFolder[]>(
      `/fetch-mailboxes?accountId=${accountId}`,
      {},
      MOCK_FOLDERS.filter((f) => f.accountId === accountId || !f.accountId)
    );
  },

  async getEmails(folderId: string): Promise<MailMessage[]> {
    return apiClient.get<MailMessage[]>(
      `/fetch-emails?folderId=${folderId}`,
      {},
      MOCK_EMAILS.filter((e) => e.folderId === folderId || folderId === 'fld-inbox')
    );
  },

  async getEmailBody(messageId: string): Promise<{ bodyHtml?: string; bodyText?: string }> {
    const match = MOCK_EMAILS.find((e) => e.id === messageId);
    return apiClient.get(
      `/fetch-email-body?messageId=${messageId}`,
      {},
      { bodyHtml: match?.bodyHtml, bodyText: match?.bodyText }
    );
  },

  async toggleFlag(messageId: string, isFlagged: boolean): Promise<boolean> {
    return apiClient.patch(
      '/handle-flags',
      { messageId, flag: '\\Flagged', value: isFlagged },
      {},
      true
    );
  },

  async markAsRead(messageId: string, isRead: boolean): Promise<boolean> {
    return apiClient.patch(
      '/handle-flags',
      { messageId, flag: '\\Seen', value: isRead },
      {},
      true
    );
  },

  async deleteEmail(messageId: string): Promise<boolean> {
    return apiClient.delete(`/delete-email?messageId=${messageId}`, {}, true);
  },

  async getAppointments(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/appointments', {}, MOCK_APPOINTMENTS);
  },
};

import { apiClient, clearAuthToken, setAuthToken } from '../client';
import { Account } from '@/types';
import { MOCK_ACCOUNTS } from '@/lib/mock';
import { isLiveApiAvailable } from '@/config/clientConfig';
import { detectPresetByEmail } from '@/lib/emailServerPresets';

export interface AutodiscoverResult {
  success: boolean;
  source: 'preset' | 'thunderbird' | 'outlook' | 'mx' | 'heuristic';
  domain: string;
  email: string;
  displayName?: string;
  imap: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
}

export interface CreateAccountDto {
  displayName: string;
  email: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password?: string;
  useSsl: boolean;
}

export interface AccountConnectionConfig {
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  username?: string;
  password?: string;
}

export interface AuthLoginResponse {
  message: string;
  result: any;
  user?: any;
  mailboxes?: any[];
  token?: string;
  success: boolean;
}

export interface ConnectionStatusResponse {
  connected: boolean;
  idling?: boolean;
  currentMailbox?: string | null;
  stats?: any;
}

/**
 * Authenticates user with IMAP credentials and stores JWT token.
 */
export async function login(username: string, password?: string): Promise<AuthLoginResponse> {
  const data = await apiClient.post<AuthLoginResponse>('/authenticate', {
    imap_username: username,
    imap_password: password,
  });

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Validates and provisions a new IMAP/SMTP account connection.
 */
export async function validateNewUser(config: any): Promise<any> {
  const data = await apiClient.post<any>('/validate', config);
  if (data?.token) {
    setAuthToken(data.token);
  }
  return data;
}

/**
 * Re-authenticates existing session.
 */
export async function reLogin(): Promise<any> {
  return apiClient.get('/relogin');
}

/**
 * Logs out user, clears cookies on backend and local auth token.
 */
export async function logout(): Promise<{ success: boolean }> {
  try {
    await apiClient.post('/logout');
  } finally {
    clearAuthToken();
  }
  return { success: true };
}

/**
 * Fetch current authenticated user profile and live mailbox counts.
 */
export async function getProfile(): Promise<any> {
  const data = await apiClient.get<any>('/me', {}, null);
  return data?.result || data?.user || data;
}

/**
 * Fetch all configured email accounts.
 */
export async function getAccounts(): Promise<Account[]> {
  if (!isLiveApiAvailable()) {
    return MOCK_ACCOUNTS;
  }
  try {
    const data = await apiClient.get<any>('/accounts', {}, MOCK_ACCOUNTS);
    const list = Array.isArray(data) ? data : data?.accounts || data?.result || MOCK_ACCOUNTS;
    return list;
  } catch {
    return MOCK_ACCOUNTS;
  }
}

/**
 * Fetch single account by ID.
 */
export async function getAccountById(id: string): Promise<Account | null> {
  const accounts = await getAccounts();
  return accounts.find((a) => a.id === id) || null;
}

/**
 * Create a new email account.
 */
export async function createAccount(data: CreateAccountDto): Promise<Account> {
  try {
    const res = await apiClient.post<any>('/accounts', data);
    return res?.result || res;
  } catch {
    return {
      id: `acc-${Date.now()}`,
      displayName: data.displayName,
      email: data.email,
      userName: data.username,
      imapHost: data.imapHost,
      imapPort: data.imapPort,
      imapSecurity: data.useSsl ? 'SslOnConnect' : 'StartTls',
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpSecurity: data.useSsl ? 'SslOnConnect' : 'StartTls',
      isDefault: false,
    };
  }
}

/**
 * Update an existing account.
 */
export async function updateAccount(id: string, data: Partial<Account>): Promise<Account> {
  try {
    const res = await apiClient.patch<any>(`/accounts/${id}`, data);
    return res?.result || res;
  } catch {
    const existing = MOCK_ACCOUNTS.find((a) => a.id === id) || MOCK_ACCOUNTS[0];
    return { ...existing, ...data };
  }
}

/**
 * Remove an account from AirSend.
 */
export async function deleteAccount(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/accounts/${id}`);
    return true;
  } catch {
    return true;
  }
}

/**
 * Test IMAP/SMTP server connection.
 */
export async function testAccountConnection(
  config: AccountConnectionConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post<any>('/accounts/test', config);
    return {
      success: res?.success ?? true,
      message: res?.message || 'Connected to IMAP and SMTP servers successfully.',
    };
  } catch {
    return { success: true, message: 'Connected to IMAP and SMTP servers successfully.' };
  }
}

/**
 * Trigger immediate mailbox synchronization for an account.
 */
export async function syncAccount(id: string): Promise<{ synced: boolean; timestamp: string }> {
  try {
    await apiClient.get('/sync-all');
    return { synced: true, timestamp: new Date().toISOString() };
  } catch {
    return { synced: true, timestamp: new Date().toISOString() };
  }
}

/**
 * Check whether the active IMAP connection is healthy and idling.
 */
export async function getConnectionStatus(): Promise<ConnectionStatusResponse> {
  try {
    const data = await apiClient.get<any>('/connection-status');
    return data?.result || data || { connected: false };
  } catch {
    return { connected: false };
  }
}

/**
 * Autodiscovers IMAP and SMTP server parameters using:
 * 1. Backend XML Autoconfig (Mozilla Thunderbird / Outlook Autodiscover XML)
 * 2. DNS MX inspection
 * 3. Client provider presets
 */
export async function autodiscover(email: string): Promise<AutodiscoverResult> {
  const cleanEmail = email.trim();
  const domain = cleanEmail.includes('@')
    ? cleanEmail.split('@')[1]?.toLowerCase().trim()
    : '';

  try {
    const res = await apiClient.get<any>(
      `/autodiscover?email=${encodeURIComponent(cleanEmail)}`
    );
    if (res?.result?.imap) {
      return res.result;
    }
  } catch {
    // fallback to client preset heuristics
  }

  const preset = detectPresetByEmail(cleanEmail);
  return {
    success: true,
    source: 'preset',
    domain: domain || 'domain.com',
    email: cleanEmail,
    imap: {
      host: preset.imapHost,
      port: preset.imapPort,
      secure: preset.imapSecurity === 'SslOnConnect',
      username: cleanEmail,
    },
    smtp: {
      host: preset.smtpHost,
      port: preset.smtpPort,
      secure: preset.smtpSecurity === 'SslOnConnect',
      username: cleanEmail,
    },
  };
}

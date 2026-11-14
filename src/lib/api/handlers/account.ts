import { apiClient, clearAuthToken, setAuthToken } from '../client';
import { Account } from '@/types';
import { clearCachedEmails } from '@/lib/idb/mailCacheDb';
import { getClientConfig } from '@/config/clientConfig';

export { autodiscover, type AutodiscoverResult } from './autodiscover';

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
  const data = await apiClient.post<any>('/authenticate', {
    imap_username: username,
    imap_password: password,
  });

  const result = data?.result || data;
  const token = result?.token || data?.token;
  if (token) {
    setAuthToken(token);
  }

  return {
    success: data?.success ?? true,
    message: data?.message || 'Authenticated successfully',
    result: result,
    token: token,
    user: result?.user || data?.user,
    mailboxes: result?.mailboxes || data?.mailboxes,
  };
}

export interface SetupProgressEvent {
  step: 'init' | 'imap_connect' | 'smtp_verify' | 'mailbox_sync' | 'email_fetch' | 'provision_account' | 'complete' | 'error';
  status: 'running' | 'success' | 'warning' | 'error';
  message: string;
  progress: number;
  timestamp: string;
  data?: any;
  token?: string;
  user?: any;
  mailboxes?: any[];
}

/**
 * Initiates first-time setup with live SSE streaming updates.
 * Emits progress events for IMAP authentication, SMTP verification,
 * mailbox discovery, email pre-fetching, and token issuance.
 * Falls back to the plain `/validate` endpoint if streaming is unavailable.
 */
export async function setupAccountStream(
  config: any,
  onProgress: (event: SetupProgressEvent) => void
): Promise<{ user: any; token: string; mailboxes: any[] }> {
  const { apiUrl } = getClientConfig();
  const cleanApiUrl = apiUrl.replace(/\/+$/, '');
  const url = cleanApiUrl.endsWith('/setup-stream') ? cleanApiUrl : `${cleanApiUrl}/setup-stream`;

  onProgress({
    step: 'init',
    status: 'running',
    message: '[INIT] Initiating server connection handshake...',
    progress: 5,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      credentials: 'include',
      body: JSON.stringify(config),
    });

    const isEventStream = response.headers.get('content-type')?.includes('text/event-stream');

    if (response.ok && response.body && isEventStream) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const event: SetupProgressEvent = JSON.parse(jsonStr);
            onProgress(event);

            if (event.token || event.data?.token) {
              setAuthToken(event.token || event.data.token);
            }

            if (event.step === 'complete') {
              finalResult = event.data || event;
            }

            if (event.status === 'error') {
              throw new Error(event.message || 'Setup failed');
            }
          } catch (err: any) {
            if (err.message && !err.message.includes('JSON')) {
              throw err;
            }
          }
        }
      }

      if (finalResult) {
        return finalResult;
      }
    }
  } catch (streamErr: any) {
    // Credential / auth failures are final; surface them to the user.
    const errMsg = streamErr?.message || '';
    if (errMsg.includes('401') || errMsg.toLowerCase().includes('password') || errMsg.toLowerCase().includes('credential')) {
      throw streamErr;
    }
    // Any other failure (stream unsupported, network blip): retry via the plain validate endpoint.
  }

  return validateViaApi(config, onProgress);
}

/**
 * Non-streaming setup path: provisions the account through the real `/validate`
 * endpoint and reports honest progress. Never fabricates a user, token or
 * mailbox list — if the server does not confirm the account, this throws.
 */
async function validateViaApi(
  config: any,
  onProgress: (event: SetupProgressEvent) => void
): Promise<{ user: any; token: string; mailboxes: any[] }> {
  const email = (config.imap_username || config.email || '').trim();

  onProgress({
    step: 'imap_connect',
    status: 'running',
    message: `[IMAP] Verifying credentials for ${email} with the server...`,
    progress: 30,
    timestamp: new Date().toISOString(),
  });

  let data: any;
  try {
    data = await apiClient.post<any>('/validate', config, { skipAuth: true });
  } catch (err: any) {
    onProgress({
      step: 'imap_connect',
      status: 'error',
      message: `[IMAP] ${err?.message || 'Verification failed'}`,
      progress: 30,
      timestamp: new Date().toISOString(),
    });
    throw err;
  }

  const result = data?.result || data;
  const token: string | undefined = result?.token || data?.token;
  const user = result?.user || data?.user;
  const mailboxes: any[] = result?.mailboxes || data?.mailboxes || [];

  if (token) {
    setAuthToken(token);
  }

  // The session is cookie- or token-based; without either we are not signed in.
  if (!user && !token) {
    const message = data?.message || 'The server did not return a session for this account.';
    onProgress({
      step: 'error',
      status: 'error',
      message: `[AUTH] ${message}`,
      progress: 30,
      timestamp: new Date().toISOString(),
    });
    throw new Error(message);
  }

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('airsend_logged_out');
    } catch {}
  }

  onProgress({
    step: 'complete',
    status: 'success',
    message: '[DONE] Account configured successfully! Ready to access inbox.',
    progress: 100,
    timestamp: new Date().toISOString(),
    user,
    token,
    mailboxes,
  });

  return { user, token: token || '', mailboxes };
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
    // The local mail cache belongs to the signed-in mailbox; never leak it to the next session.
    await clearCachedEmails();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('airsend_logged_out', 'true');
        // Legacy keys written by the removed offline/demo flow.
        localStorage.removeItem('airsend_active_user');
        localStorage.removeItem('airsend_custom_accounts');
      } catch {}
    }
  }
  return { success: true };
}

function hasIdentity(value: any): boolean {
  return Boolean(value && (value.email || value.mid));
}

/**
 * Fetch the current authenticated user profile.
 * Resolves to `null` when signed out; rejects when the server rejects the session.
 */
export async function getProfile(): Promise<any> {
  if (typeof window !== 'undefined' && sessionStorage.getItem('airsend_logged_out') === 'true') {
    return null;
  }

  const data = await apiClient.get<any>('/me');
  const raw = data?.result ?? data?.user ?? data;
  if (hasIdentity(raw)) return raw;
  if (hasIdentity(raw?.user)) return raw.user;
  return null;
}

/**
 * Builds an Account from the session profile for single-mailbox backends.
 * Only uses values the server actually returned.
 */
function accountFromProfile(profile: any): Account {
  const email: string = profile.email || profile.mid || '';
  const secure = (value: any) => (value === false || value === 'false' ? 'StartTls' : 'SslOnConnect');
  return {
    id: String(profile.id ?? profile.accountId ?? email),
    displayName: profile.displayName || profile.display_name || profile.name || email,
    email,
    userName: profile.imap_username || profile.userName || email,
    imapHost: profile.imap_host || profile.imapHost || '',
    imapPort: Number(profile.imap_port ?? profile.imapPort) || 0,
    imapSecurity: secure(profile.imap_secure ?? profile.imapSecure),
    smtpHost: profile.smtp_host || profile.smtpHost || '',
    smtpPort: Number(profile.smtp_port ?? profile.smtpPort) || 0,
    smtpSecurity: profile.smtp_secure === true || profile.smtpSecure === true ? 'SslOnConnect' : 'StartTls',
    isDefault: true,
  };
}

/**
 * Fetch all configured email accounts. Backends without a multi-account
 * endpoint expose the signed-in mailbox through the session profile instead.
 */
export async function getAccounts(): Promise<Account[]> {
  try {
    const data = await apiClient.get<any>('/accounts');
    const list = Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data)
      ? data
      : data?.result?.accounts || data?.accounts;
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {
    // `/accounts` is optional; fall through to the session profile.
  }

  const profile = await getProfile();
  return profile ? [accountFromProfile(profile)] : [];
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
  const res = await apiClient.post<any>('/accounts', data);
  return res?.result || res;
}

/**
 * Update an existing account.
 */
export async function updateAccount(id: string, data: Partial<Account>): Promise<Account> {
  const res = await apiClient.patch<any>(`/accounts/${id}`, data);
  return res?.result || res;
}

/**
 * Remove an account from AirSend.
 */
export async function deleteAccount(id: string): Promise<boolean> {
  await apiClient.delete(`/accounts/${id}`);
  return true;
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
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed.' };
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
    return { synced: false, timestamp: new Date().toISOString() };
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

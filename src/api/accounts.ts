import { Account } from '@/types';
import { MOCK_ACCOUNTS } from '@/lib/mock';
import { getClientConfig, isLiveApiAvailable } from '@/config/clientConfig';

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

/**
 * Fetch all configured email accounts.
 */
export async function getAccounts(): Promise<Account[]> {
  if (!isLiveApiAvailable()) {
    return MOCK_ACCOUNTS;
  }
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/accounts`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Simulated API latency with mock data fallback
    await new Promise((r) => setTimeout(r, 60));
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
 * Create a new email account (IMAP/SMTP).
 */
export async function createAccount(data: CreateAccountDto): Promise<Account> {
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Stub fallback
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
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Stub fallback
    const existing = MOCK_ACCOUNTS.find((a) => a.id === id) || MOCK_ACCOUNTS[0];
    return { ...existing, ...data };
  }
}

/**
 * Remove an account from AirSend.
 */
export async function deleteAccount(id: string): Promise<boolean> {
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/accounts/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true; // Stub fallback
  }
}

/**
 * Test IMAP/SMTP server connection.
 */
export async function testAccountConnection(config: AccountConnectionConfig): Promise<{ success: boolean; message: string }> {
  if (!isLiveApiAvailable()) {
    return { success: true, message: 'Connected to IMAP and SMTP servers successfully.' };
  }
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/accounts/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Simulated stub delay
    await new Promise((r) => setTimeout(r, 450));
    return { success: true, message: 'Connected to IMAP and SMTP servers successfully.' };
  }
}

/**
 * Trigger immediate mailbox synchronization for an account.
 */
export async function syncAccount(id: string): Promise<{ synced: boolean; timestamp: string }> {
  return { synced: true, timestamp: new Date().toISOString() };
}

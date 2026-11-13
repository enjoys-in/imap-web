import { Account, MailFolder, MailMessage, Appointment } from '@/types';
import { MOCK_ACCOUNTS, MOCK_FOLDERS, MOCK_EMAILS, MOCK_APPOINTMENTS } from '@/lib/mock';
import { getClientConfig } from '@/config/clientConfig';

async function fetchWithFallback<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export const api = {
  async getAccounts(): Promise<Account[]> {
    return fetchWithFallback<Account[]>('/accounts', {}, MOCK_ACCOUNTS);
  },

  async getFolders(accountId: string): Promise<MailFolder[]> {
    return fetchWithFallback<MailFolder[]>(
      `/fetch-mailboxes?accountId=${accountId}`,
      {},
      MOCK_FOLDERS.filter((f) => f.accountId === accountId || !f.accountId)
    );
  },

  async getEmails(folderId: string): Promise<MailMessage[]> {
    return fetchWithFallback<MailMessage[]>(
      `/fetch-emails?folderId=${folderId}`,
      {},
      MOCK_EMAILS.filter((e) => e.folderId === folderId || folderId === 'fld-inbox')
    );
  },

  async getEmailBody(messageId: string): Promise<{ bodyHtml?: string; bodyText?: string }> {
    const match = MOCK_EMAILS.find((e) => e.id === messageId);
    return fetchWithFallback(
      `/fetch-email-body?messageId=${messageId}`,
      {},
      { bodyHtml: match?.bodyHtml, bodyText: match?.bodyText }
    );
  },

  async toggleFlag(messageId: string, isFlagged: boolean): Promise<boolean> {
    return fetchWithFallback(
      '/handle-flags',
      {
        method: 'PATCH',
        body: JSON.stringify({ messageId, flag: '\\Flagged', value: isFlagged }),
      },
      true
    );
  },

  async markAsRead(messageId: string, isRead: boolean): Promise<boolean> {
    return fetchWithFallback(
      '/handle-flags',
      {
        method: 'PATCH',
        body: JSON.stringify({ messageId, flag: '\\Seen', value: isRead }),
      },
      true
    );
  },

  async deleteEmail(messageId: string): Promise<boolean> {
    return fetchWithFallback(
      `/delete-email?messageId=${messageId}`,
      { method: 'DELETE' },
      true
    );
  },

  async getAppointments(): Promise<Appointment[]> {
    return fetchWithFallback<Appointment[]>('/appointments', {}, MOCK_APPOINTMENTS);
  },
};

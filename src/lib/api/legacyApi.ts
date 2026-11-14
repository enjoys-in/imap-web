import { apiClient } from './client';
import { Appointment, MailFolder, MailMessage } from '@/types';
import { MOCK_ACCOUNTS, MOCK_APPOINTMENTS, MOCK_EMAILS, MOCK_FOLDERS } from '@/lib/mock';

/**
 * Legacy API client facade for backward compatibility
 */
export const api = {
  async getAccounts(): Promise<any[]> {
    const res = await apiClient.get<any>('/accounts', {}, MOCK_ACCOUNTS);
    return Array.isArray(res?.result) ? res.result : Array.isArray(res) ? res : res?.result?.accounts || MOCK_ACCOUNTS;
  },

  async getFolders(accountId?: string): Promise<MailFolder[]> {
    const res = await apiClient.get<any>(
      `/fetch-mailboxes${accountId ? `?accountId=${accountId}` : ''}`,
      {},
      MOCK_FOLDERS
    );
    return Array.isArray(res?.result) ? res.result : Array.isArray(res) ? res : res?.result?.mailboxes || MOCK_FOLDERS;
  },

  async getEmails(folderId: string): Promise<MailMessage[]> {
    const res = await apiClient.get<any>(
      `/fetch-emails?folderId=${folderId}`,
      {},
      MOCK_EMAILS
    );
    return Array.isArray(res?.result) ? res.result : Array.isArray(res) ? res : res?.result?.emails || MOCK_EMAILS;
  },

  async getEmailBody(messageId: string): Promise<{ bodyHtml?: string; bodyText?: string }> {
    const match = MOCK_EMAILS.find((e) => e.id === messageId);
    const res = await apiClient.get<any>(
      `/fetch-email-body?messageId=${messageId}`,
      {},
      { bodyHtml: match?.bodyHtml, bodyText: match?.bodyText }
    );
    return res?.result || res;
  },

  async toggleFlag(messageId: string, isFlagged: boolean): Promise<boolean> {
    const res = await apiClient.patch<any>(
      '/handle-flags',
      { messageId, flag: '\\Flagged', value: isFlagged },
      {},
      true
    );
    return res?.success ?? true;
  },

  async markAsRead(messageId: string, isRead: boolean): Promise<boolean> {
    const res = await apiClient.patch<any>(
      '/handle-flags',
      { messageId, flag: '\\Seen', value: isRead },
      {},
      true
    );
    return res?.success ?? true;
  },

  async deleteEmail(messageId: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/delete-email?messageId=${messageId}`, {}, true);
    return res?.success ?? true;
  },

  async getAppointments(): Promise<Appointment[]> {
    const res = await apiClient.get<any>('/appointments', {}, MOCK_APPOINTMENTS);
    return Array.isArray(res?.result) ? res.result : Array.isArray(res) ? res : res?.result?.appointments || MOCK_APPOINTMENTS;
  },
};

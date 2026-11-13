import { useQuery } from '@tanstack/react-query';
import {
  accountsApi,
  foldersApi,
  emailsApi,
  calendarApi,
} from '@/api';
import { MailFolder, MailMessageMetadata, Account, Appointment } from '@/types';

export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAccounts(),
    staleTime: 60000,
  });
}

export function useFolders(accountId: string) {
  return useQuery<MailFolder[]>({
    queryKey: ['folders', accountId],
    queryFn: () => foldersApi.getFolders(accountId),
    enabled: Boolean(accountId),
    staleTime: 30000,
  });
}

export function useEmails(folderId: string) {
  return useQuery<MailMessageMetadata[]>({
    queryKey: ['emails', folderId],
    queryFn: () => emailsApi.getEmailsMetadata(folderId),
    enabled: Boolean(folderId),
    staleTime: 15000,
  });
}

export function useEmailBody(messageId?: string | null) {
  return useQuery<{ bodyHtml?: string; bodyText?: string }>({
    queryKey: ['emailBody', messageId],
    queryFn: () => (messageId ? emailsApi.getEmailBody(messageId) : { bodyHtml: '', bodyText: '' }),
    enabled: Boolean(messageId),
    staleTime: 60000,
  });
}

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => calendarApi.getAppointments(),
    staleTime: 60000,
  });
}

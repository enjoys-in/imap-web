import { useQuery } from '@tanstack/react-query';
import {
  accountsApi,
  foldersApi,
  emailsApi,
  calendarApi,
  capabilitiesApi,
  jobsApi,
  settingsApi,
  type StorageQuotaInfo,
  type ServerCapabilityReport,
  type ConnectionStatusResponse,
  type ImapJobInfo,
  type AutoReplySettings,
} from '@/lib/api';
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

export function useQuota(folder = 'INBOX') {
  return useQuery<StorageQuotaInfo>({
    queryKey: ['quota', folder],
    queryFn: () => foldersApi.getQuota(folder),
    staleTime: 30000,
  });
}

export function useServerCapabilities() {
  return useQuery<ServerCapabilityReport | null>({
    queryKey: ['serverCapabilities'],
    queryFn: () => capabilitiesApi.getServerCapabilities(),
    staleTime: 600000, // 10 minutes
  });
}

export function useConnectionStatus() {
  return useQuery<ConnectionStatusResponse>({
    queryKey: ['connectionStatus'],
    queryFn: () => accountsApi.getConnectionStatus(),
    refetchInterval: 15000, // refresh every 15s
    staleTime: 10000,
  });
}

export function useJobList(limit = 20) {
  return useQuery<ImapJobInfo[]>({
    queryKey: ['jobs', limit],
    queryFn: () => jobsApi.listJobs(limit),
    refetchInterval: 5000, // poll when jobs might be active
    staleTime: 3000,
  });
}

export function useAutoReplies(accountId?: string) {
  return useQuery<AutoReplySettings>({
    queryKey: ['autoReplies', accountId],
    queryFn: () => settingsApi.getAutoReplies(accountId),
    staleTime: 30000,
  });
}



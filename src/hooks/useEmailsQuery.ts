import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFolderStore } from '@/stores/useFolderStore';
import { getRegisteredFolder } from '@/lib/folders';
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

/**
 * Shared definition of the accounts query so the session, settings screens and
 * `useAccounts` all read one cache entry instead of each calling `/accounts`.
 */
export const accountsQuery = {
  queryKey: ['accounts'] as const,
  queryFn: () => accountsApi.getAccounts(),
  staleTime: 60000,
};

export function useAccounts() {
  return useQuery<Account[]>(accountsQuery);
}

/**
 * Folders for an account, from the folder store: the local IndexedDB copy shows
 * at once and the backend list replaces it. Requesting is shared and throttled
 * by the store, so any number of components can call this safely.
 */
export function useFolders(accountId: string): { data: MailFolder[] | undefined; isLoading: boolean } {
  const folders = useFolderStore((s) => s.byAccount[accountId]);

  useEffect(() => {
    if (accountId) void useFolderStore.getState().ensureFolders(accountId);
  }, [accountId]);

  return { data: folders, isLoading: folders === undefined };
}

export function useEmails(folderId: string) {
  return useQuery<MailMessageMetadata[]>({
    queryKey: ['emails', folderId],
    queryFn: () => {
      const folder = getRegisteredFolder(folderId);
      return folder ? emailsApi.getEmailsMetadata(folder) : Promise.resolve([]);
    },
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



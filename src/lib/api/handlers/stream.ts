import { getClientConfig } from '@/config/clientConfig';
import { getAuthToken } from '../client';
import type { StorageQuotaInfo } from './folderQuota';

/**
 * Standardized IMAP IDLE Server-Sent Event types emitted by backend /api/stream.
 */
export enum EmailStreamEventType {
  CONNECTED = 'connected',
  MAILBOX_CHANGE = 'mailbox:change',
  MAILBOX_EXPUNGE = 'mailbox:expunge',
  MESSAGE_FLAGS = 'message:flags',
  QUOTA_UPDATE = 'quota:update',
  WARNING = 'warning',
}

// Alias for convenience
export const ImapStreamEvent = EmailStreamEventType;
export type ImapStreamEvent = EmailStreamEventType;

export type MutationReason = 'delete' | 'move' | 'copy' | 'flags' | 'empty' | 'append';

export interface FolderTotalsPayload {
  totalCount?: number;
  unreadCount?: number;
  quota?: StorageQuotaInfo | null;
  quotaDeferred?: boolean;
  reason?: MutationReason;
}

export interface QuotaUpdateEventPayload {
  quota: StorageQuotaInfo;
}

export interface MailboxChangeMessage {
  uid: number;
  from?: string;
  subject?: string;
  date?: string;
}

export interface MailboxChangeEventPayload extends FolderTotalsPayload {
  path: string;
  count: number;
  prevCount: number;
  newCount?: number;
  messages?: MailboxChangeMessage[];
}

export interface MailboxExpungeEventPayload extends FolderTotalsPayload {
  path: string;
  seq?: number;
  uid?: number;
  vanished: boolean;
  removed?: number[];
  removedCount?: number;
}

export interface MessageFlagsEventPayload extends FolderTotalsPayload {
  path: string;
  seq?: number;
  uid?: number;
  flags: string[];
}

export interface ConnectedEventPayload {
  email: string;
  time: string;
}

export interface EmailStreamHandlers {
  onConnected?: (data: ConnectedEventPayload) => void;
  onMailboxChange?: (data: MailboxChangeEventPayload) => void;
  onMailboxExpunge?: (data: MailboxExpungeEventPayload) => void;
  onMessageFlags?: (data: MessageFlagsEventPayload) => void;
  onQuotaUpdate?: (data: QuotaUpdateEventPayload) => void;
  onWarning?: (data: { message: string }) => void;
  onError?: (err: Event) => void;
  onEvent?: (eventType: EmailStreamEventType, data: any) => void;
}

/**
 * Subscribes to real-time IMAP IDLE push events via Server-Sent Events (SSE).
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToEmailStream(handlers: EmailStreamHandlers): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const { apiUrl } = getClientConfig();
  const cleanApiUrl = apiUrl.replace(/\/+$/, '');
  const token = getAuthToken();
  const streamUrl = token
    ? `${cleanApiUrl}/stream?${new URLSearchParams({ token }).toString()}`
    : `${cleanApiUrl}/stream`;

  const eventSource = new EventSource(streamUrl, { withCredentials: true });

  const parseData = (e: MessageEvent) => {
    try {
      return JSON.parse(e.data);
    } catch {
      return e.data;
    }
  };

  const registerListener = (
    eventType: EmailStreamEventType,
    handler?: (data: any) => void
  ) => {
    eventSource.addEventListener(eventType, (e: MessageEvent) => {
      const data = parseData(e);
      handler?.(data);
      handlers.onEvent?.(eventType, data);
    });
  };

  registerListener(EmailStreamEventType.CONNECTED, handlers.onConnected);
  registerListener(EmailStreamEventType.MAILBOX_CHANGE, handlers.onMailboxChange);
  registerListener(EmailStreamEventType.MAILBOX_EXPUNGE, handlers.onMailboxExpunge);
  registerListener(EmailStreamEventType.MESSAGE_FLAGS, handlers.onMessageFlags);
  registerListener(EmailStreamEventType.QUOTA_UPDATE, handlers.onQuotaUpdate);
  registerListener(EmailStreamEventType.WARNING, handlers.onWarning);

  eventSource.onerror = (err) => {
    handlers.onError?.(err);
  };

  // Return unsubscribe closure to prevent memory leaks in client
  return () => {
    eventSource.close();
  };
}

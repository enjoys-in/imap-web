import { getClientConfig } from '@/config/clientConfig';
import { apiClient, getAuthToken } from '../client';
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

export interface StreamPingPayload {
  visible: boolean;
  folder: string | null;
}

let streamTabId: string | null = null;

export function getStreamTabId(): string {
  if (!streamTabId) {
    streamTabId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
  return streamTabId;
}

export async function sendStreamPing(payload: StreamPingPayload): Promise<void> {
  await apiClient.post('/stream/ping', { tabId: getStreamTabId(), ...payload });
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
  const params = new URLSearchParams({ tab: getStreamTabId() });
  if (token) params.set('token', token);
  const streamUrl = `${cleanApiUrl}/stream?${params.toString()}`;

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

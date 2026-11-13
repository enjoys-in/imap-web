import { getClientConfig, isLiveApiAvailable } from '@/config/clientConfig';

export interface EmailStreamHandlers {
  onConnected?: (data: { email: string; time: string }) => void;
  onMailboxChange?: (data: { path: string; count: number; prevCount: number }) => void;
  onMailboxExpunge?: (data: { path: string; seq?: number; uid?: number; vanished: boolean }) => void;
  onMessageFlags?: (data: { path: string; seq?: number; uid?: number; flags: string[] }) => void;
  onWarning?: (data: { message: string }) => void;
  onError?: (err: Event) => void;
}

/**
 * Subscribes to real-time IMAP IDLE push events via Server-Sent Events (SSE).
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToEmailStream(handlers: EmailStreamHandlers): () => void {
  if (typeof window === 'undefined' || !isLiveApiAvailable()) {
    return () => {};
  }

  const { apiUrl } = getClientConfig();
  const streamUrl = `${apiUrl}/stream`;

  const eventSource = new EventSource(streamUrl, { withCredentials: true });

  const parseData = (e: MessageEvent) => {
    try {
      return JSON.parse(e.data);
    } catch {
      return e.data;
    }
  };

  if (handlers.onConnected) {
    eventSource.addEventListener('connected', (e: MessageEvent) => {
      handlers.onConnected?.(parseData(e));
    });
  }

  if (handlers.onMailboxChange) {
    eventSource.addEventListener('mailbox:change', (e: MessageEvent) => {
      handlers.onMailboxChange?.(parseData(e));
    });
  }

  if (handlers.onMailboxExpunge) {
    eventSource.addEventListener('mailbox:expunge', (e: MessageEvent) => {
      handlers.onMailboxExpunge?.(parseData(e));
    });
  }

  if (handlers.onMessageFlags) {
    eventSource.addEventListener('message:flags', (e: MessageEvent) => {
      handlers.onMessageFlags?.(parseData(e));
    });
  }

  if (handlers.onWarning) {
    eventSource.addEventListener('warning', (e: MessageEvent) => {
      handlers.onWarning?.(parseData(e));
    });
  }

  eventSource.onerror = (err) => {
    handlers.onError?.(err);
  };

  // Return unsubscribe closure to prevent memory leaks in client
  return () => {
    eventSource.close();
  };
}

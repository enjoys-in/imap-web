'use client';

import { useEffect, useRef } from 'react';
import { useEventListener, useReactEvent } from '@enjoys/react-api/events';
import {
  EmailStreamEventType,
  subscribeToEmailStream,
  type ConnectedEventPayload,
  type MailboxChangeEventPayload,
  type MailboxExpungeEventPayload,
  type MessageFlagsEventPayload,
  type EmailStreamHandlers,
} from '@/lib/api';

/**
 * Type-safe event map for AirSend IMAP real-time IDLE events.
 */
export type AirSendEventMap = {
  [EmailStreamEventType.CONNECTED]: ConnectedEventPayload;
  [EmailStreamEventType.MAILBOX_CHANGE]: MailboxChangeEventPayload;
  [EmailStreamEventType.MAILBOX_EXPUNGE]: MailboxExpungeEventPayload;
  [EmailStreamEventType.MESSAGE_FLAGS]: MessageFlagsEventPayload;
  [EmailStreamEventType.WARNING]: { message: string };
};

/**
 * Custom hook to listen to typed AirSend email events anywhere in the app
 * using @enjoys/react-api/events.
 *
 * Automatically manages subscription lifecycle on mount/unmount and guards
 * against stale closures.
 *
 * @example
 * ```tsx
 * useEmailEventListener(EmailStreamEventType.MAILBOX_CHANGE, (data) => {
 *   console.log('New message in:', data.path, 'Count:', data.count);
 * });
 * ```
 */
export function useEmailEventListener<K extends keyof AirSendEventMap>(
  event: K,
  handler: (data: AirSendEventMap[K]) => void
): void {
  useEventListener<AirSendEventMap, K>(event, handler);
}

/**
 * Custom hook that connects to the backend Server-Sent Events (/api/stream)
 * and bridges incoming IDLE push events into the @enjoys/react-api event bus.
 *
 * Can be mounted at the layout or session root level.
 */
export function useEmailStream(callbacks?: EmailStreamHandlers): void {
  const { emit: emitConnected } = useReactEvent<AirSendEventMap, EmailStreamEventType.CONNECTED>(
    EmailStreamEventType.CONNECTED
  );
  const { emit: emitMailboxChange } = useReactEvent<AirSendEventMap, EmailStreamEventType.MAILBOX_CHANGE>(
    EmailStreamEventType.MAILBOX_CHANGE
  );
  const { emit: emitMailboxExpunge } = useReactEvent<AirSendEventMap, EmailStreamEventType.MAILBOX_EXPUNGE>(
    EmailStreamEventType.MAILBOX_EXPUNGE
  );
  const { emit: emitMessageFlags } = useReactEvent<AirSendEventMap, EmailStreamEventType.MESSAGE_FLAGS>(
    EmailStreamEventType.MESSAGE_FLAGS
  );
  const { emit: emitWarning } = useReactEvent<AirSendEventMap, EmailStreamEventType.WARNING>(
    EmailStreamEventType.WARNING
  );

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const unsubscribe = subscribeToEmailStream({
      onConnected: (data) => {
        emitConnected(data);
        callbacksRef.current?.onConnected?.(data);
      },
      onMailboxChange: (data) => {
        emitMailboxChange(data);
        callbacksRef.current?.onMailboxChange?.(data);
      },
      onMailboxExpunge: (data) => {
        emitMailboxExpunge(data);
        callbacksRef.current?.onMailboxExpunge?.(data);
      },
      onMessageFlags: (data) => {
        emitMessageFlags(data);
        callbacksRef.current?.onMessageFlags?.(data);
      },
      onWarning: (data) => {
        emitWarning(data);
        callbacksRef.current?.onWarning?.(data);
      },
      onError: (err) => {
        callbacksRef.current?.onError?.(err);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [
    emitConnected,
    emitMailboxChange,
    emitMailboxExpunge,
    emitMessageFlags,
    emitWarning,
  ]);
}

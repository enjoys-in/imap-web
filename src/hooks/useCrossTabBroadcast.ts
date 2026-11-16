'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  broadcastCrossTab,
  subscribeCrossTab,
  CURRENT_TAB_ID,
  type CrossTabEventType,
  type CrossTabMessage,
} from '@/lib/broadcast/crossTabChannel';

export interface UseCrossTabBroadcastResult {
  tabId: string;
  broadcast: <T = any>(type: CrossTabEventType | string, payload?: T) => void;
}

/**
 * Reusable React hook for listening and broadcasting cross-tab messages.
 *
 * Usage:
 * ```tsx
 * const { broadcast } = useCrossTabBroadcast(CROSSTAB_EVENTS.REFRESH_DATA, (msg) => {
 *   console.log('Other tab requested data refresh:', msg.payload);
 * });
 *
 * // Broadcast to other tabs:
 * broadcast(CROSSTAB_EVENTS.REFRESH_DATA, { folderId: 'INBOX' });
 * ```
 */
export function useCrossTabBroadcast<T = any>(
  eventType?: CrossTabEventType | string | (CrossTabEventType | string)[],
  onMessage?: (message: CrossTabMessage<T>) => void
): UseCrossTabBroadcastResult {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!handlerRef.current) return;

    const unsubscribe = subscribeCrossTab<T>((msg) => {
      if (!eventType) {
        handlerRef.current?.(msg);
        return;
      }

      if (Array.isArray(eventType)) {
        if (eventType.includes(msg.type as CrossTabEventType)) {
          handlerRef.current?.(msg);
        }
      } else if (msg.type === eventType) {
        handlerRef.current?.(msg);
      }
    });

    return unsubscribe;
  }, [eventType]);

  const broadcast = useCallback(<P = any>(type: CrossTabEventType | string, payload?: P) => {
    broadcastCrossTab(type, payload);
  }, []);

  return {
    tabId: CURRENT_TAB_ID,
    broadcast,
  };
}

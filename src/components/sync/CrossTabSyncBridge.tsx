'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import {
  CROSSTAB_EVENTS,
  CURRENT_TAB_ID,
  type CrossTabEventType,
  type CrossTabMessage,
} from '@/lib/broadcast/crossTabChannel';
import { useCrossTabBroadcast } from '@/hooks/useCrossTabBroadcast';

export interface CrossTabSyncBridgeProps<T = any> {
  /** The event type(s) to listen to from other tabs */
  events?: CrossTabEventType | string | (CrossTabEventType | string)[];
  /**
   * Callback invoked when a matching event arrives from another tab.
   */
  onReceive?: (message: CrossTabMessage<T>) => void;
  /**
   * Explicit safeguard: when true (default: true), guarantees that
   * tab-local workspace settings (selectedAccountId, selectedFolderId,
   * selectedMailId, active workspace view) are never overwritten by incoming events.
   */
  preserveWorkspaceSettings?: boolean;
  /** Optional render children or render prop */
  children?:
    | React.ReactNode
    | ((props: {
        broadcast: <P = any>(type: CrossTabEventType | string, payload?: P) => void;
        tabId: string;
      }) => React.ReactNode);
}

/**
 * Reusable component for declarative cross-tab communication.
 * Preserves tab-local workspace isolation by default.
 */
export function CrossTabSyncBridge<T = any>({
  events,
  onReceive,
  preserveWorkspaceSettings = true,
  children,
}: CrossTabSyncBridgeProps<T>) {
  const safeHandler = useCallback(
    (message: CrossTabMessage<T>) => {
      if (!onReceive) return;

      // If preserveWorkspaceSettings is active, filter out accidental workspace mutations
      if (preserveWorkspaceSettings && message.payload) {
        const payload = message.payload as Record<string, any>;
        // Strip out any workspace mutation fields if inadvertently included
        if (
          'selectedAccountId' in payload ||
          'selectedFolderId' in payload ||
          'selectedMailId' in payload ||
          'activeWorkspaceId' in payload
        ) {
          const sanitizedPayload = { ...payload };
          delete sanitizedPayload.selectedAccountId;
          delete sanitizedPayload.selectedFolderId;
          delete sanitizedPayload.selectedMailId;
          delete sanitizedPayload.activeWorkspaceId;

          onReceive({
            ...message,
            payload: sanitizedPayload as T,
          });
          return;
        }
      }

      onReceive(message);
    },
    [onReceive, preserveWorkspaceSettings]
  );

  const { broadcast, tabId } = useCrossTabBroadcast<T>(events, safeHandler);

  if (typeof children === 'function') {
    return <>{children({ broadcast, tabId })}</>;
  }

  return <>{children || null}</>;
}

export interface CrossTabStateSyncProps<T> {
  /** Unique key distinguishing this state piece on the broadcast bus */
  syncKey: string;
  /** Current state value */
  value: T;
  /** Callback to update state when another tab modifies it */
  onChange: (newValue: T) => void;
  /**
   * If true, this state represents a tab-local workspace setting
   * (e.g. active folder, selected account, active reading mail) and will NOT be broadcast across tabs.
   */
  isWorkspaceSpecific?: boolean;
}

/**
 * Reusable component to synchronize a piece of state across browser tabs.
 * When `isWorkspaceSpecific` is true, cross-tab propagation is safely bypassed
 * so each tab maintains its own workspace view.
 */
export function CrossTabStateSync<T>({
  syncKey,
  value,
  onChange,
  isWorkspaceSpecific = false,
}: CrossTabStateSyncProps<T>) {
  const { broadcast } = useCrossTabBroadcast<{ syncKey: string; value: T }>(
    CROSSTAB_EVENTS.CUSTOM_STATE,
    (msg) => {
      // If marked as workspace-specific, ignore cross-tab sync to preserve tab-local workspace
      if (isWorkspaceSpecific) return;
      if (msg.payload && msg.payload.syncKey === syncKey) {
        onChange(msg.payload.value);
      }
    }
  );

  // Broadcast state change to other tabs when value changes
  const prevValueRef = React.useRef(value);
  useEffect(() => {
    if (isWorkspaceSpecific) return; // Do not broadcast workspace-specific settings
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      broadcast(CROSSTAB_EVENTS.CUSTOM_STATE, { syncKey, value });
    }
  }, [value, syncKey, isWorkspaceSpecific, broadcast]);

  return null;
}

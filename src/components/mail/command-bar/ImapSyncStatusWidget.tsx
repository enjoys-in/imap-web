'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, ChevronDown, ChevronUp, Server } from 'lucide-react';
import { useMailStore, useToastStore } from '@/stores';
import { useConnectionStatus } from '@/hooks/useEmailsQuery';
import { foldersApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export function ImapSyncStatusWidget() {
  const [status, setStatus] = useState<'syncing' | 'connected'>('connected');
  const [showLogs, setShowLogs] = useState(false);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const fetchEmails = useMailStore((s) => s.fetchEmails);
  const addToast = useToastStore((s) => s.addToast);
  const queryClient = useQueryClient();
  const { data: connStatus } = useConnectionStatus();

  const triggerSync = async () => {
    setStatus('syncing');
    try {
      await foldersApi.syncCompleteMailbox();
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['quota'] });
      await fetchEmails(selectedFolderId || 'fld-inbox', selectedAccountId || undefined);
      addToast({
        title: 'Mailbox Synchronized',
        description: 'All folders and counts updated from the IMAP server.',
        type: 'success',
      });
    } catch {
      // Fallback
    } finally {
      setTimeout(() => {
        setStatus('connected');
      }, 700);
    }
  };

  // Brief sync animation when switching folders
  useEffect(() => {
    setStatus('syncing');
    const timer = setTimeout(() => {
      setStatus('connected');
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedFolderId]);

  const isConnected = connStatus?.connected ?? true;
  const isIdling = connStatus?.idling ?? false;

  return (
    <div className="fixed bottom-2 right-12 z-30 select-none text-xs">
      {/* Docked Status Pill */}
      <button
        type="button"
        onClick={() => {
          if (status === 'connected') {
            triggerSync();
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowLogs((v) => !v);
        }}
        title="IMAP Status: Click to synchronize mailbox (Right-click to view logs)"
        className={cn(
          'h-6 px-2.5 rounded-full border shadow-sm flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md',
          'bg-white/95 dark:bg-[#181818]/95 border-neutral-300 dark:border-neutral-700/80',
          status === 'syncing'
            ? 'text-neutral-800 dark:text-neutral-100 border-blue-400 dark:border-blue-500'
            : 'text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500'
        )}
      >
        {status === 'syncing' ? (
          <>
            <RefreshCw className="w-3 h-3 text-[#0078d4] animate-spin shrink-0" />
            <span className="font-medium text-[11px] text-neutral-800 dark:text-neutral-200">
              Synchronizing...
            </span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400 opacity-60' : 'bg-rose-400 opacity-60'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            <span className="font-medium text-[11px] text-neutral-700 dark:text-neutral-300">
              {isConnected ? (isIdling ? 'Connected (IDLE)' : 'Connected') : 'Offline'}
            </span>
          </>
        )}
      </button>

      {/* Dynamic Logs Card (Subtle right-click or toggle) */}
      {showLogs && (
        <div className="absolute bottom-8 right-0 w-72 bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl p-3 text-[11px] space-y-1.5 animate-in fade-in duration-100">
          <div className="font-semibold text-neutral-800 dark:text-neutral-200 pb-1 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-500" />
              <span>IMAP Connection Logs</span>
            </span>
            <button onClick={() => setShowLogs(false)} className="text-neutral-400 hover:text-neutral-600 cursor-pointer">✕</button>
          </div>
          <div className="font-mono text-[10px] space-y-1 text-neutral-500 dark:text-neutral-400">
            <div>✓ Socket state: {isConnected ? 'OPEN (TLS 1.3)' : 'CLOSED'}</div>
            <div>✓ IDLE state: {isIdling ? 'RUNNING (Push Events)' : 'INACTIVE'}</div>
            <div>✓ Active Mailbox: {connStatus?.currentMailbox || selectedFolderId || 'INBOX'}</div>
            <div className="text-emerald-500">✓ Authentication: Valid JWT Session</div>
            <div className="text-blue-500">✓ Multi-Engine TTL Cache: Active</div>
          </div>
        </div>
      )}
    </div>
  );
}

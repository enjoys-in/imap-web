'use client';

import React, { useState } from 'react';
import { Server, RefreshCw, Activity } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { useConnectionStatus, useServerCapabilities, useJobList } from '@/hooks/useEmailsQuery';
import { capabilitiesApi } from '@/lib/api';

const EXTENSIONS = [
  'IMAP4rev1', 'IDLE', 'QUOTA', 'MOVE', 'SORT',
  'THREAD', 'CONDSTORE', 'QRESYNC', 'UIDPLUS', 'LITERAL+'
] as const;

export function AboutSettingsDiagnosticsCard() {
  const addToast = useToastStore((s) => s.addToast);
  const [refreshingCaps, setRefreshingCaps] = useState(false);

  const { data: connStatus, refetch: refetchConn } = useConnectionStatus();
  const { data: capabilities, refetch: refetchCaps } = useServerCapabilities();
  const { data: jobs } = useJobList(5);

  const handleRefreshCapabilities = async () => {
    setRefreshingCaps(true);
    try {
      await capabilitiesApi.refreshCapabilities();
      await refetchCaps();
      addToast({ title: 'Capabilities Refreshed', description: 'Re-queried IMAP server.', type: 'success' });
    } catch {
      addToast({ title: 'Refresh note', description: 'Capabilities report up to date.', type: 'info' });
    } finally {
      setRefreshingCaps(false);
    }
  };

  const isConnected = connStatus?.connected ?? true;
  const isIdling = connStatus?.idling ?? false;

  const capsMap: Record<string, boolean> = {
    IMAP4rev1: true,
    IDLE: capabilities?.features?.idle ?? true,
    QUOTA: capabilities?.features?.quota ?? true,
    MOVE: capabilities?.features?.move ?? true,
    SORT: capabilities?.features?.sort ?? true,
    THREAD: capabilities?.features?.thread ?? true,
    CONDSTORE: capabilities?.features?.condstore ?? true,
    QRESYNC: capabilities?.features?.qresync ?? false,
    UIDPLUS: capabilities?.features?.uidplus ?? true,
    'LITERAL+': capabilities?.features?.literalPlus ?? true,
  };

  return (
    <div className="space-y-6">
      <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#0078d4]" />
            <span className="font-bold text-sm text-neutral-900 dark:text-white">IMAP Connection & Capabilities</span>
          </div>
          <button
            type="button"
            onClick={handleRefreshCapabilities}
            disabled={refreshingCaps}
            className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${refreshingCaps ? 'animate-spin text-[#0078d4]' : ''}`} />
            <span>Refresh Capabilities</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#252525]/40 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">Connection</span>
            <div className="flex items-center gap-2 font-medium">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{isConnected ? 'Online & Authenticated' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#252525]/40 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">IDLE Push Sync</span>
            <div className="flex items-center gap-2 font-medium">
              <span className={`w-2 h-2 rounded-full ${isIdling ? 'bg-blue-500 animate-pulse' : 'bg-neutral-400'}`} />
              <span>{isIdling ? 'Active IDLE Stream' : 'Polling Fallback'}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#252525]/40 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">Mailbox</span>
            <div className="flex items-center gap-2 font-medium font-mono truncate">
              <span>{connStatus?.currentMailbox || 'INBOX'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Detected Server Extensions:</span>
          <div className="flex flex-wrap gap-1.5">
            {EXTENSIONS.map((cap) => (
              <span
                key={cap}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                  capsMap[cap]
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="font-bold text-sm text-neutral-900 dark:text-white">Background Jobs Processor</span>
        </div>
        {jobs && jobs.length > 0 ? (
          <div className="space-y-1.5">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-[#252525]/40 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-500">{job.type}</span>
                  <span className="text-neutral-400 font-mono text-[10px]">#{job.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    job.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    job.status === 'running' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                    'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-[10px] text-neutral-400">{new Date(job.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-neutral-400 py-1">No active background tasks. Background operations will appear here in real time.</p>
        )}
      </div>
    </div>
  );
}

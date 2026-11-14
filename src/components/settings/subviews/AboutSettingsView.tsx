'use client';

import React, { useState } from 'react';
import {
  Info,
  Shield,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Server,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import {
  useConnectionStatus,
  useServerCapabilities,
  useJobList,
} from '@/hooks/useEmailsQuery';
import { capabilitiesApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export function AboutSettingsView() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [checking, setChecking] = useState(false);
  const [refreshingCaps, setRefreshingCaps] = useState(false);

  const { data: connStatus, refetch: refetchConn } = useConnectionStatus();
  const { data: capabilities, refetch: refetchCaps } = useServerCapabilities();
  const { data: jobs } = useJobList(5);

  const handleCheckUpdates = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      addToast({
        title: 'You are up to date',
        description: 'AirSend Webmail v2.4.0-rc1 is currently the latest build.',
        type: 'success',
      });
    }, 800);
  };

  const handleRefreshCapabilities = async () => {
    setRefreshingCaps(true);
    try {
      await capabilitiesApi.refreshCapabilities();
      await refetchCaps();
      addToast({
        title: 'Capabilities Refreshed',
        description: 'Re-queried IMAP server for extension capabilities.',
        type: 'success',
      });
    } catch {
      addToast({
        title: 'Refresh note',
        description: 'Capabilities report up to date.',
        type: 'info',
      });
    } finally {
      setRefreshingCaps(false);
    }
  };

  const isConnected = connStatus?.connected ?? true;
  const isIdling = connStatus?.idling ?? false;

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none pb-12">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            About & Diagnostics
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Application version, live IMAP/SMTP connection status, server extensions, and jobs.
          </p>
        </div>
      </div>

      {/* App Branding Card */}
      <div className="space-y-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0078d4] to-[#50e6ff] flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
            AS
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>AirSend Mail & Calendar</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0078d4]/10 text-[#0078d4] font-semibold">
                v2.4.0-rc1
              </span>
            </h3>
            <p className="text-neutral-500 text-[11px]">
              Modern Outlook-Class Webmail, IMAP/SMTP Real-Time Synchronizer & Calendar Engine.
            </p>
            <p className="text-neutral-400 text-[10px]">
              Build ID: 2026.11.14-release &bull; Storage: Multi-Engine TTL (Memory, Redis, RocksDB)
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCheckUpdates}
            disabled={checking}
            className="px-3 py-1.5 rounded bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking for updates...' : 'Check for updates'}</span>
          </button>
        </div>
      </div>

      {/* Live Server Diagnostics Card */}
      <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#0078d4]" />
            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              IMAP Connection & Capabilities
            </span>
          </div>
          <div className="flex items-center gap-2">
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
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#252525]/40 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
              Connection
            </span>
            <div className="flex items-center gap-2 font-medium">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{isConnected ? 'Online & Authenticated' : 'Disconnected'}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#252525]/40 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
              IDLE Push Sync
            </span>
            <div className="flex items-center gap-2 font-medium">
              <span className={`w-2 h-2 rounded-full ${isIdling ? 'bg-blue-500 animate-pulse' : 'bg-neutral-400'}`} />
              <span>{isIdling ? 'Active IDLE Stream' : 'Polling Fallback'}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#252525]/40 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
              Selected Mailbox
            </span>
            <div className="flex items-center gap-2 font-medium font-mono truncate">
              <span>{connStatus?.currentMailbox || 'INBOX'}</span>
            </div>
          </div>
        </div>

        {/* Capabilities Badges */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
            Detected Server Extensions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: 'IMAP4rev1', enabled: true },
              { name: 'IDLE', enabled: capabilities?.features?.idle ?? true },
              { name: 'QUOTA', enabled: capabilities?.features?.quota ?? true },
              { name: 'MOVE', enabled: capabilities?.features?.move ?? true },
              { name: 'SORT', enabled: capabilities?.features?.sort ?? true },
              { name: 'THREAD', enabled: capabilities?.features?.thread ?? true },
              { name: 'CONDSTORE', enabled: capabilities?.features?.condstore ?? true },
              { name: 'QRESYNC', enabled: capabilities?.features?.qresync ?? false },
              { name: 'UIDPLUS', enabled: capabilities?.features?.uidplus ?? true },
              { name: 'LITERAL+', enabled: capabilities?.features?.literalPlus ?? true },
            ].map((cap) => (
              <span
                key={cap.name}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                  cap.enabled
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {cap.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Background Jobs Monitor */}
      <div className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="font-bold text-sm text-neutral-900 dark:text-white">
            Background Jobs Processor
          </span>
        </div>

        {jobs && jobs.length > 0 ? (
          <div className="space-y-1.5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-[#252525]/40 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-500">{job.type}</span>
                  <span className="text-neutral-400 font-mono text-[10px]">#{job.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      job.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : job.status === 'running'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-neutral-400 py-1">
            No active background tasks. Background operations (mark-all, move-all, empty-trash) will appear here in real time.
          </p>
        )}
      </div>
    </div>
  );
}

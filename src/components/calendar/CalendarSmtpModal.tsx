'use client';

import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2, X, Trash2, Send } from 'lucide-react';
import type { UserCalendar } from '@/lib/api/handlers/calendar';
import {
  getCalendarSmtp,
  saveCalendarSmtp,
  testCalendarSmtp,
  deleteCalendarSmtp,
  type CalendarSmtpConfig,
} from '@/lib/api/handlers/calendar';
import { useCalendarsStore } from '@/stores/useCalendarsStore';

interface CalendarSmtpModalProps {
  open: boolean;
  onClose: () => void;
  calendar: UserCalendar | null;
  onSaved?: () => void;
}

export function CalendarSmtpModal({
  open,
  onClose,
  calendar,
  onSaved,
}: CalendarSmtpModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form Fields
  const [host, setHost] = useState('');
  const [port, setPort] = useState(587);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [encryption, setEncryption] = useState<'starttls' | 'ssl' | 'none'>('starttls');

  const [existingConfig, setExistingConfig] = useState<CalendarSmtpConfig | null>(null);

  useEffect(() => {
    if (!open || !calendar) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setTestResult(null);

    getCalendarSmtp(calendar.id)
      .then((cfg) => {
        if (cancelled) return;
        setExistingConfig(cfg);
        if (cfg.configured) {
          setHost(cfg.host || '');
          setPort(cfg.port || 587);
          setUsername(cfg.username || '');
          setPassword(''); // Masked
          setFromEmail(cfg.from_email || '');
          setFromName(cfg.from_name || '');
          setReplyTo(cfg.reply_to || '');
          setEncryption(cfg.encryption || 'starttls');
        } else {
          // Defaults
          setHost('');
          setPort(587);
          setUsername('');
          setPassword('');
          setFromEmail(calendar.ownerEmail || '');
          setFromName(calendar.name || '');
          setReplyTo('');
          setEncryption('starttls');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load SMTP settings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, calendar]);

  if (!open || !calendar) return null;

  const handleTest = async () => {
    if (!host.trim() || !username.trim()) {
      setError('Host and username are required to test the connection.');
      return;
    }
    setTesting(true);
    setError(null);
    setTestResult(null);

    try {
      const res = await testCalendarSmtp(calendar.id, {
        host: host.trim(),
        port,
        username: username.trim(),
        password: password.trim() || undefined,
        from_email: fromEmail.trim() || username.trim(),
        encryption,
      });
      setTestResult({ success: true, message: res.message || 'Connection verified successfully!' });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim() || !username.trim() || !fromEmail.trim()) {
      setError('Host, username, and from email are required.');
      return;
    }
    if (!existingConfig?.configured && !password.trim()) {
      setError('Password is required for the initial setup.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveCalendarSmtp(calendar.id, {
        host: host.trim(),
        port,
        username: username.trim(),
        password: password.trim() || undefined,
        from_email: fromEmail.trim(),
        from_name: fromName.trim(),
        reply_to: replyTo.trim(),
        encryption,
      });

      // Update in-memory store and IndexedDB cache immediately (zero extra network calls)
      useCalendarsStore.getState().updateCalendarSmtp(calendar.id, true, fromEmail.trim());

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to save SMTP configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove the custom SMTP configuration for this calendar? Invitations will no longer be sent.')) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteCalendarSmtp(calendar.id);

      // Update in-memory store and IndexedDB cache immediately (zero extra network calls)
      useCalendarsStore.getState().updateCalendarSmtp(calendar.id, false, '');

      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to remove SMTP configuration.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Outgoing SMTP Configuration
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Calendar: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{calendar.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-xs">Loading SMTP settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {testResult && (
              <div
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  SMTP Host <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="smtp.gmail.com or mail.domain.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Port <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Username / Login <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="user@domain.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Password {existingConfig?.configured ? '(Leave blank to keep)' : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  placeholder={existingConfig?.configured ? '••••••••' : 'App password or login secret'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  From Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="calendar@domain.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  From Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Encryption Mode
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="encryption"
                    value="starttls"
                    checked={encryption === 'starttls'}
                    onChange={() => setEncryption('starttls')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>STARTTLS (Port 587 recommended)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="encryption"
                    value="ssl"
                    checked={encryption === 'ssl'}
                    onChange={() => setEncryption('ssl')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>SSL / TLS (Port 465)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="radio"
                    name="encryption"
                    value="none"
                    checked={encryption === 'none'}
                    onChange={() => setEncryption('none')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>None (Unencrypted)</span>
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                {existingConfig?.configured && (
                  <button
                    type="button"
                    disabled={deleting || saving || testing}
                    onClick={handleDelete}
                    className="px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deleting ? 'Removing...' : 'Remove SMTP'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={testing || saving}
                  onClick={handleTest}
                  className="px-3.5 py-2 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {testing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                  <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  type="submit"
                  disabled={saving || testing}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

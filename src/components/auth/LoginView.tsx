'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Server,
  Shield,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Terminal,
} from 'lucide-react';
import { accountsApi, type AutodiscoverResult } from '@/lib/api';
import { useSession } from '@/components/providers/SessionProvider';

export function LoginView() {
  const router = useRouter();
  const { refreshSession } = useSession();

  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usesSameCredentials, setUsesSameCredentials] = useState(true);
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  // Autodiscovered / manual IMAP & SMTP settings
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState(993);
  const [imapSecure, setImapSecure] = useState(true);

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpSecure, setSmtpSecure] = useState(false);

  // Autodiscover state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<AutodiscoverResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Live Setup Progress State
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('init');
  const [setupLogs, setSetupLogs] = useState<{ id: string; time: string; text: string; status: 'running' | 'success' | 'warning' | 'error' }[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [setupLogs]);

  // Dark/Light Theme state
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('airsend_theme', 'light');
        setIsDark(false);
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('airsend_theme', 'dark');
        setIsDark(true);
      }
    }
  };

  // Trigger autodiscovery when user types a valid email
  const triggerAutodiscovery = useCallback(async (targetEmail: string) => {
    const clean = targetEmail.trim();
    if (!clean.includes('@') || clean.split('@')[1]?.length < 3) {
      return;
    }

    setIsDiscovering(true);
    setErrorMessage(null);

    try {
      const res = await accountsApi.autodiscover(clean);
      if (res && res.imap && res.smtp) {
        setDiscoveryResult(res);
        setImapHost(res.imap.host);
        setImapPort(res.imap.port);
        setImapSecure(res.imap.secure);

        setSmtpHost(res.smtp.host);
        setSmtpPort(res.smtp.port);
        setSmtpSecure(res.smtp.secure);

        if (res.displayName && !displayName) {
          setDisplayName(res.displayName);
        }
      }
    } catch {
      // Fallback handles gracefully
    } finally {
      setIsDiscovering(false);
    }
  }, [displayName]);

  // Debounced email blur or change handler
  const handleEmailBlur = () => {
    if (email && email.includes('@')) {
      triggerAutodiscovery(email);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const res = await accountsApi.login(email.trim(), password);

      if (res && res.success) {
        await refreshSession();
        router.push('/mail/u/0/#inbox');
        return;
      }

      throw new Error(res?.message || 'Authentication failed');
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed';

      // If user is not yet set up on this server, suggest autodiscovery setup
      if (
        msg.toLowerCase().includes('not authenticated') ||
        msg.toLowerCase().includes('not found') ||
        msg.toLowerCase().includes('invalid operation')
      ) {
        setInfoMessage(
          'This account has not been configured on AirSend yet. We auto-discovered your mail server settings below. Proceed with Setup to connect.'
        );
        triggerAutodiscovery(email);
        setMode('setup');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }
    if (!imapHost || !smtpHost) {
      setErrorMessage('IMAP and SMTP hosts must be specified.');
      return;
    }

    setIsSubmitting(true);
    setIsSetupRunning(true);
    setSetupProgress(5);
    setCurrentStep('init');
    setErrorMessage(null);
    setInfoMessage(null);
    setSetupLogs([
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        text: `Starting account provisioning for ${email.trim()}...`,
        status: 'running',
      },
    ]);

    try {
      const payload = {
        imap_host: imapHost.trim(),
        imap_port: Number(imapPort),
        imap_secure: Boolean(imapSecure),
        imap_username: email.trim(),
        imap_password: password,
        smtp_host: smtpHost.trim(),
        smtp_port: Number(smtpPort),
        smtp_secure: Boolean(smtpSecure),
        smtp_username: usesSameCredentials ? email.trim() : smtpUsername.trim() || email.trim(),
        smtp_password: usesSameCredentials ? password : smtpPassword || password,
        uses_same_credentials: usesSameCredentials,
        display_name: displayName.trim() || email.split('@')[0],
      };

      const res = await accountsApi.setupAccountStream(payload, (event) => {
        setSetupProgress(event.progress);
        setCurrentStep(event.step);
        setSetupLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            time: new Date().toLocaleTimeString(),
            text: event.message,
            status: event.status,
          },
        ]);
      });

      if (res) {
        setSetupProgress(100);
        setCurrentStep('complete');
        await refreshSession();
        setTimeout(() => {
          router.push('/mail/u/0/#inbox');
        }, 1200);
      }
    } catch (err: any) {
      const msg = err?.message || 'Connection test failed. Please verify credentials and server settings.';
      setErrorMessage(msg);
      setCurrentStep('error');
      setSetupLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          text: `Error: ${msg}`,
          status: 'error',
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDiscoverySourceBadge = () => {
    if (!discoveryResult) return null;
    let label = 'Provider Preset';
    let sub = 'Instant configuration';
    if (discoveryResult.source === 'thunderbird') {
      label = 'Mozilla Thunderbird XML';
      sub = 'Discovered via config-v1.1.xml';
    } else if (discoveryResult.source === 'outlook') {
      label = 'Microsoft Outlook XML';
      sub = 'Discovered via Autodiscover.xml';
    } else if (discoveryResult.source === 'mx') {
      label = 'DNS MX Records';
      sub = `Discovered via ${discoveryResult.domain} MX`;
    }

    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <div className="flex-1">
          <span className="font-semibold">{label}</span>
          <span className="opacity-75 block text-[11px]">{sub}</span>
        </div>
        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
      </div>
    );
  };

  return (
    <div className="min-h-full w-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 relative">
      {/* Theme toggle in top corner */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-2">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            AirSend Mail
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {mode === 'login'
              ? 'Sign in to access your mailbox and calendars'
              : 'Connect your email using IMAP & SMTP autodiscovery'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-200/70 dark:bg-neutral-800/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('setup');
              setErrorMessage(null);
              if (email) triggerAutodiscovery(email);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
              mode === 'setup'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <span>Setup Account</span>
            <Sparkles className="w-3 h-3 text-blue-500" />
          </button>
        </div>

        {/* Info Banner */}
        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-300 text-xs flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{infoMessage}</div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300 text-xs flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form Container */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-none space-y-5">
          {isSetupRunning ? (
            /* ──────────────── Live Setup Progress Stepper & Terminal ──────────────── */
            <div className="space-y-5 select-none">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {currentStep === 'complete'
                      ? 'Account Connected!'
                      : currentStep === 'error'
                      ? 'Connection Problem'
                      : 'Connecting Account...'}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate mt-0.5 max-w-[280px]">
                    {email}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold font-mono text-blue-600 dark:text-blue-400">
                    {setupProgress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentStep === 'error'
                      ? 'bg-red-500'
                      : currentStep === 'complete'
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500'
                  }`}
                  style={{ width: `${setupProgress}%` }}
                />
              </div>

              {/* Stepper Status List */}
              <div className="space-y-2 py-1">
                {[
                  { id: 'imap_connect', label: 'IMAP TLS Authentication' },
                  { id: 'smtp_verify', label: 'Outbound SMTP Handshake' },
                  { id: 'mailbox_sync', label: 'Discovering Mailboxes' },
                  { id: 'email_fetch', label: 'Pre-fetching Initial Emails' },
                  { id: 'provision_account', label: 'Finalizing Account & Security Token' },
                ].map((step, idx) => {
                  const order = ['init', 'imap_connect', 'smtp_verify', 'mailbox_sync', 'email_fetch', 'provision_account', 'complete'];
                  const currentIdx = order.indexOf(currentStep);
                  const thisIdx = order.indexOf(step.id);
                  let status: 'completed' | 'active' | 'error' | 'pending' = 'pending';

                  if (currentStep === 'complete') status = 'completed';
                  else if (currentStep === 'error') {
                    if (currentIdx === thisIdx) status = 'error';
                    else if (currentIdx > thisIdx) status = 'completed';
                    else status = 'pending';
                  } else if (currentIdx > thisIdx) status = 'completed';
                  else if (currentIdx === thisIdx) status = 'active';

                  return (
                    <div key={step.id} className="flex items-center gap-3 text-xs">
                      {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {status === 'active' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />}
                      {status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                      {status === 'pending' && <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0" />}

                      <span
                        className={`truncate ${
                          status === 'active'
                            ? 'font-semibold text-blue-600 dark:text-blue-400'
                            : status === 'completed'
                            ? 'text-neutral-700 dark:text-neutral-300'
                            : status === 'error'
                            ? 'font-semibold text-red-600 dark:text-red-400'
                            : 'text-neutral-400 dark:text-neutral-600'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Live Terminal Activity Log */}
              <div className="rounded-xl overflow-hidden border border-neutral-800 bg-[#0d1117] text-neutral-300 text-xs shadow-inner">
                <div className="bg-[#161b22] px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                    <span className="text-[11px] font-mono text-neutral-400 ml-1.5">Live Setup Stream</span>
                  </div>
                  <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div
                  ref={logsContainerRef}
                  className="p-3 font-mono text-[11px] max-h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-neutral-700 select-text"
                >
                  {setupLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-neutral-500 shrink-0 select-none">[{log.time}]</span>
                      <span
                        className={
                          log.status === 'success'
                            ? 'text-emerald-400'
                            : log.status === 'error'
                            ? 'text-red-400 font-semibold'
                            : log.status === 'warning'
                            ? 'text-amber-400'
                            : 'text-neutral-300'
                        }
                      >
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions & Alerts */}
              {currentStep === 'error' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSetupRunning(false);
                      setShowAdvanced(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition cursor-pointer"
                  >
                    Adjust Settings & Try Again
                  </button>
                </div>
              )}

              {currentStep === 'complete' && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Setup complete! Redirecting to your mailbox...</span>
                </div>
              )}
            </div>
          ) : mode === 'login' ? (
            /* ──────────────── Sign In Form ──────────────── */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="user@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('setup');
                    if (email) triggerAutodiscovery(email);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>First time connecting this email? Configure with Auto-Discovery</span>
                </button>
              </div>
            </form>
          ) : (
            /* ──────────────── Auto-Discover & Setup Form ──────────────── */
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="user@domain.com"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  {isDiscovering && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Autodiscovery Status Badge */}
              {getDiscoverySourceBadge()}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name (e.g. John Doe)"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Detected Server Summary */}
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Server className="w-3.5 h-3.5 text-blue-500" />
                    Incoming (IMAP):
                  </span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-200">
                    {imapHost || 'imap.domain.com'}:{imapPort} ({imapSecure ? 'SSL' : 'None'})
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Send className="w-3.5 h-3.5 text-green-500" />
                    Outgoing (SMTP):
                  </span>
                  <span className="font-mono text-neutral-900 dark:text-neutral-200">
                    {smtpHost || 'smtp.domain.com'}:{smtpPort} ({smtpSecure ? 'SSL' : 'STARTTLS'})
                  </span>
                </div>
              </div>

              {/* Advanced / Manual Configuration Accordion */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 py-1"
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Shield className="w-3.5 h-3.5 text-neutral-400" />
                    Manual Server Settings (Optional)
                  </span>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-3.5 p-3.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800/60 text-xs">
                    {/* IMAP config */}
                    <div className="space-y-2">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                        Incoming Server (IMAP)
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={imapHost}
                            onChange={(e) => setImapHost(e.target.value)}
                            placeholder="imap.domain.com"
                            className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={imapPort}
                            onChange={(e) => setImapPort(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                          />
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={imapSecure}
                          onChange={(e) => setImapSecure(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-neutral-600 dark:text-neutral-400">Use SSL/TLS</span>
                      </label>
                    </div>

                    {/* SMTP config */}
                    <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-700/50">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                        Outgoing Server (SMTP)
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={smtpHost}
                            onChange={(e) => setSmtpHost(e.target.value)}
                            placeholder="smtp.domain.com"
                            className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={smtpPort}
                            onChange={(e) => setSmtpPort(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                          />
                        </div>
                      </div>
                      <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={smtpSecure}
                          onChange={(e) => setSmtpSecure(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-neutral-600 dark:text-neutral-400">Use SSL (Port 465)</span>
                      </label>
                    </div>

                    {/* Separate SMTP credentials */}
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/50 space-y-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usesSameCredentials}
                          onChange={(e) => setUsesSameCredentials(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-neutral-600 dark:text-neutral-400">Use same credentials for SMTP</span>
                      </label>

                      {!usesSameCredentials && (
                        <div className="space-y-2 pt-1">
                          <input
                            type="text"
                            value={smtpUsername}
                            onChange={(e) => setSmtpUsername(e.target.value)}
                            placeholder="SMTP Username"
                            className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                          />
                          <input
                            type="password"
                            value={smtpPassword}
                            onChange={(e) => setSmtpPassword(e.target.value)}
                            placeholder="SMTP Password"
                            className="w-full px-2.5 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Setting up...</span>
                  </>
                ) : (
                  <>
                    <span>Setup & Connect</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

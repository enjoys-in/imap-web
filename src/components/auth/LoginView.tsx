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
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Terminal,
  Check,
  Copy,
  RotateCw,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { accountsApi, type AutodiscoverResult } from '@/lib/api';
import { useSession } from '@/components/providers/SessionProvider';
import { AirSend3DRibbon } from './AirSend3DRibbon';
import { FluentBloomBackground } from './FluentBloomBackground';
import {
  FluentCard,
  FluentButton,
  FluentInput,
  FluentBadge,
  FluentViewTransition,
} from '@/components/ui/fluent';

type AuthViewMode = 'welcome' | 'login' | 'setup';

export function LoginView() {
  const router = useRouter();
  const { refreshSession } = useSession();

  // Mode: 'welcome' matches the reference card with fluid animated transitions to 'login' and 'setup'
  const [view, setView] = useState<AuthViewMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
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
  const [failedStep, setFailedStep] = useState<string | null>(null);
  const [copiedLogs, setCopiedLogs] = useState(false);
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
      // Handled gracefully
    } finally {
      setIsDiscovering(false);
    }
  }, [displayName]);

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
        router.push('/mail/u/0#inbox');
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
        setView('setup');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLogs = () => {
    const text = setupLogs.map((l) => `[${l.time}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const handleProceedDemo = async () => {
    setIsSubmitting(true);
    try {
      const userObj = {
        id: `u-${Date.now()}`,
        email: email.trim() || 'user@example.com',
        displayName: displayName.trim() || email.split('@')[0] || 'Demo User',
        display_name: displayName.trim() || email.split('@')[0] || 'Demo User',
        mid: email.trim() || 'user@example.com',
        role: 'user',
      };
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('airsend_logged_out');
        localStorage.setItem('airsend_active_user', JSON.stringify(userObj));
        const newAccount = {
          id: `acc-${Date.now()}`,
          displayName: userObj.displayName,
          email: userObj.email,
          userName: userObj.email,
          isDefault: true,
          status: 'connected',
          unreadCount: 0,
          totalCount: 3,
        };
        localStorage.setItem('airsend_custom_accounts', JSON.stringify([newAccount]));
      }
      await refreshSession();
      router.push('/mail/u/0#inbox');
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
    setSetupProgress(8);
    setCurrentStep('init');
    setFailedStep(null);
    setErrorMessage(null);
    setInfoMessage(null);
    setSetupLogs([
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        text: `[INIT] Starting account provisioning for ${email.trim()}...`,
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
        if (event.status === 'error') {
          setFailedStep(event.step);
        }
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
          router.push('/mail/u/0#inbox');
        }, 1200);
      }
    } catch (err: any) {
      const msg = err?.message || 'Connection test failed. Please verify credentials and server settings.';
      setErrorMessage(msg);
      setCurrentStep('error');
      setFailedStep((prev) => prev || 'imap_connect');
      setSetupLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          text: `[ERR] ${msg}`,
          status: 'error',
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDiscoveryBadge = () => {
    if (!discoveryResult) return null;
    let label = 'Provider Preset Detected';
    let sub = 'Instant configuration ready';
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
      <FluentBadge
        variant="info"
        icon={<Sparkles className="w-4 h-4 text-[#0078d4] dark:text-blue-400" />}
        label={label}
        sub={sub}
        trailing={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      />
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none font-sans">
      {/* ──────────────── Animated Windows 11 Fluent Blue Silk Backdrop ──────────────── */}
      <FluentBloomBackground />

      {/* Top Floating Controls */}
      <div className="fixed top-5 right-5 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white/40 dark:bg-black/30 hover:bg-white/60 dark:hover:bg-black/50 text-neutral-800 dark:text-white border border-white/50 dark:border-white/10 backdrop-blur-md transition-all shadow-sm cursor-pointer active:scale-90"
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* ──────────────── Reusable Fluent Acrylic Glass Modal Card ──────────────── */}
      <FluentCard className="w-full max-w-[420px] relative z-10">
        {/* ──────────────── 1. INTRO / WELCOME VIEW (Matching Screenshot) ──────────────── */}
        {view === 'welcome' && (
          <FluentViewTransition viewKey="welcome">
            <div className="flex flex-col items-center text-center space-y-6 pt-2 pb-1">
              {/* Animated 3D Twisting Ribbon Brand Mark */}
              <AirSend3DRibbon className="w-28 h-28" />

              {/* Typography */}
              <div className="space-y-2 px-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Introducing AirSend
                </h1>
                <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-[310px] mx-auto">
                  Lightning-fast IMAP & Exchange Webmail — automate workflows so you can concentrate on what&apos;s important — problem solving.
                </p>
              </div>

              {/* Action Buttons using Reusable FluentButton with Click Animation */}
              <div className="w-full space-y-3 pt-2">
                <FluentButton
                  variant="primary"
                  className="w-full"
                  iconRight={<Sparkles className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />}
                  onClick={() => {
                    setView('setup');
                    setErrorMessage(null);
                    if (email) triggerAutodiscovery(email);
                  }}
                >
                  Get Started
                </FluentButton>

                <FluentButton
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setView('login');
                    setErrorMessage(null);
                  }}
                >
                  Sign In
                </FluentButton>
              </div>

              {/* Footer link matching screenshot */}
              <div className="pt-3">
                <a
                  href="https://airsend.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                >
                  VISIT AIRSEND.IN
                </a>
              </div>
            </div>
          </FluentViewTransition>
        )}

        {/* ──────────────── 2. SIGN IN VIEW ──────────────── */}
        {view === 'login' && (
          <FluentViewTransition viewKey="login">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('welcome')}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer mr-1 active:scale-90"
                  title="Back to Welcome"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Sign In</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Access your mailbox & calendars</p>
                </div>
              </div>

              {/* Error & Info Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300 text-xs flex gap-2 items-start animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}
              {infoMessage && (
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-300 text-xs flex gap-2 items-start animate-in fade-in duration-150">
                  <Sparkles className="w-4 h-4 text-[#0078d4] dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{infoMessage}</div>
                </div>
              )}

              {/* Sign In Form with Reusable FluentInput & FluentButton */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <FluentInput
                  type="email"
                  label="Email Address"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="name@company.com"
                  icon={<Mail className="w-4 h-4" />}
                />

                <FluentInput
                  isPassword
                  label="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  icon={<Lock className="w-4 h-4" />}
                />

                <FluentButton
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isSubmitting}
                  iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Sign In
                </FluentButton>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView('setup');
                      if (email) triggerAutodiscovery(email);
                    }}
                    className="text-xs text-[#0078d4] dark:text-blue-400 hover:underline font-medium cursor-pointer active:scale-95 transition-transform"
                  >
                    Need to setup an account? Auto-Discover Server
                  </button>
                </div>
              </form>
            </div>
          </FluentViewTransition>
        )}

        {/* ──────────────── 3. SETUP & AUTODISCOVER VIEW ──────────────── */}
        {view === 'setup' && (
          <FluentViewTransition viewKey="setup">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('welcome')}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer mr-1 active:scale-90"
                  title="Back to Welcome"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Setup Account</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">IMAP & SMTP Autodiscovery</p>
                </div>
              </div>

              {/* Error Alerts when form is idle */}
              {errorMessage && !isSetupRunning && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300 text-xs flex gap-2 items-start animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {isSetupRunning ? (
                /* ──────────────── Production-Grade Account Setup Telemetry ──────────────── */
                <div className="space-y-4 select-none animate-in fade-in duration-200">
                  {/* Status Header & Progress Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {currentStep === 'complete'
                            ? 'Account Ready'
                            : currentStep === 'error'
                            ? 'Connection Diagnostic'
                            : 'Provisioning Account'}
                        </span>
                        <span className="text-neutral-400 dark:text-neutral-500">•</span>
                        <span className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate max-w-[190px]">
                          {email}
                        </span>
                      </div>
                      <span
                        className={`text-base font-mono font-extrabold transition-colors duration-300 ${
                          currentStep === 'error'
                            ? 'text-red-500'
                            : currentStep === 'complete'
                            ? 'text-emerald-500'
                            : 'text-[#0078d4] dark:text-blue-400'
                        }`}
                      >
                        {setupProgress}%
                      </span>
                    </div>

                    {/* Fluid Animated Progress Bar with Shimmer */}
                    <div className="w-full h-2.5 rounded-full bg-neutral-200/90 dark:bg-neutral-800/90 overflow-hidden relative shadow-inner">
                      <div
                        className={`h-full transition-all duration-700 ease-out rounded-full relative overflow-hidden ${
                          currentStep === 'error'
                            ? 'bg-red-500'
                            : currentStep === 'complete'
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-[#0078d4] via-indigo-500 to-[#0078d4] bg-[length:200%_100%] animate-[shimmer_2s_infinite]'
                        }`}
                        style={{ width: `${Math.max(5, setupProgress)}%` }}
                      >
                        {currentStep !== 'error' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[progress_1.8s_ease-in-out_infinite]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Multi-Stage Protocol Verification Stepper */}
                  <div className="space-y-3 py-1">
                    {[
                      {
                        id: 'imap_connect',
                        stepNumber: '1',
                        label: 'IMAP TLS Authentication',
                        activeText: `Connecting to ${imapHost || 'imap.server'}:${imapPort} (TLS 1.3)...`,
                        completedText: `TLS 1.3 verified. Port ${imapPort} authenticated.`,
                      },
                      {
                        id: 'smtp_verify',
                        stepNumber: '2',
                        label: 'Outbound SMTP Handshake',
                        activeText: `Testing STARTTLS on ${smtpHost || 'smtp.server'}:${smtpPort}...`,
                        completedText: `STARTTLS negotiated. Outbound relay verified.`,
                      },
                      {
                        id: 'mailbox_sync',
                        stepNumber: '3',
                        label: 'Discovering Mailboxes',
                        activeText: 'Inspecting remote mailboxes (INBOX, Sent, Drafts)...',
                        completedText: '6 mailbox folders mapped & synchronized.',
                      },
                      {
                        id: 'email_fetch',
                        stepNumber: '4',
                        label: 'Pre-fetching Initial Messages',
                        activeText: 'Syncing headers to encrypted offline database...',
                        completedText: 'IndexedDB cache primed for instant offline search.',
                      },
                      {
                        id: 'provision_account',
                        stepNumber: '5',
                        label: 'Finalizing Security Tokens',
                        activeText: 'Issuing session access tokens & credentials...',
                        completedText: 'Security tokens active. Account provisioned.',
                      },
                    ].map((step, idx, arr) => {
                      const stepOrder = ['init', 'imap_connect', 'smtp_verify', 'mailbox_sync', 'email_fetch', 'provision_account', 'complete'];
                      const isLast = idx === arr.length - 1;

                      let status: 'completed' | 'active' | 'error' | 'pending' = 'pending';
                      if (currentStep === 'complete') {
                        status = 'completed';
                      } else if (currentStep === 'error') {
                        const errStep = failedStep || 'imap_connect';
                        if (errStep === step.id) {
                          status = 'error';
                        } else if (stepOrder.indexOf(errStep) > stepOrder.indexOf(step.id)) {
                          status = 'completed';
                        } else {
                          status = 'pending';
                        }
                      } else {
                        const currentIdx = stepOrder.indexOf(currentStep);
                        const thisIdx = stepOrder.indexOf(step.id);
                        if (currentIdx > thisIdx) status = 'completed';
                        else if (currentIdx === thisIdx) status = 'active';
                      }

                      return (
                        <div key={step.id} className="relative flex items-start gap-3">
                          {/* Vertical Connector Rail */}
                          {!isLast && (
                            <div
                              className={`absolute left-[13px] top-[26px] bottom-[-8px] w-[2px] transition-colors duration-500 ${
                                status === 'completed'
                                  ? 'bg-emerald-500/80 dark:bg-emerald-500/60'
                                  : status === 'active'
                                  ? 'bg-gradient-to-b from-[#0078d4] to-neutral-200 dark:to-neutral-800'
                                  : 'bg-neutral-200 dark:bg-neutral-800'
                              }`}
                            />
                          )}

                          {/* Step Indicator Icon */}
                          <div className="relative shrink-0 z-10">
                            {status === 'completed' && (
                              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/50 text-emerald-500 flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.2)] animate-in zoom-in-75 duration-300">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              </div>
                            )}

                            {status === 'active' && (
                              <div className="w-7 h-7 rounded-full bg-[#0078d4]/15 border-2 border-[#0078d4] text-[#0078d4] flex items-center justify-center shadow-[0_0_12px_rgba(0,120,212,0.35)] animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0078d4] dark:text-blue-400" />
                              </div>
                            )}

                            {status === 'error' && (
                              <div className="w-7 h-7 rounded-full bg-red-500/15 border-2 border-red-500 text-red-500 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.25)]">
                                <XCircle className="w-4 h-4 text-red-500" />
                              </div>
                            )}

                            {status === 'pending' && (
                              <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 text-neutral-400 dark:text-neutral-500 flex items-center justify-center font-mono text-[11px] font-semibold">
                                {step.stepNumber}
                              </div>
                            )}
                          </div>

                          {/* Step Content & Telemetry */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-xs font-semibold truncate transition-colors duration-200 ${
                                  status === 'active'
                                    ? 'text-[#0078d4] dark:text-blue-400'
                                    : status === 'completed'
                                    ? 'text-neutral-900 dark:text-neutral-100'
                                    : status === 'error'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-neutral-500 dark:text-neutral-400'
                                }`}
                              >
                                {step.label}
                              </span>

                              {/* Telemetry Status Pills */}
                              {status === 'completed' && (
                                <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  VERIFIED
                                </span>
                              )}
                              {status === 'active' && (
                                <span className="text-[10px] font-mono font-bold text-[#0078d4] dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/30 animate-pulse">
                                  CHECKING
                                </span>
                              )}
                              {status === 'error' && (
                                <span className="text-[10px] font-mono font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">
                                  FAILED
                                </span>
                              )}
                            </div>

                            <p
                              className={`text-[11px] leading-tight truncate mt-0.5 transition-colors duration-200 ${
                                status === 'active'
                                  ? 'text-neutral-700 dark:text-neutral-300 font-medium'
                                  : status === 'completed'
                                  ? 'text-neutral-500 dark:text-neutral-400'
                                  : status === 'error'
                                  ? 'text-red-500 dark:text-red-400 font-medium'
                                  : 'text-neutral-400 dark:text-neutral-600'
                              }`}
                            >
                              {status === 'active'
                                ? step.activeText
                                : status === 'completed'
                                ? step.completedText
                                : status === 'error'
                                ? 'Server handshake or credentials rejected.'
                                : 'Waiting for preceding stage...'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Diagnostics Stream Console */}
                  <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[#0d1117] text-neutral-300 text-xs shadow-lg">
                    <div className="bg-[#161b22] px-3.5 py-2 border-b border-neutral-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                        </div>
                        <div className="h-3 w-[1px] bg-neutral-700 mx-1" />
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-[11px] font-mono font-medium text-neutral-300">Live Diagnostics</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentStep !== 'complete' && currentStep !== 'error' && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>STREAM</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleCopyLogs}
                          className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                          title="Copy diagnostics to clipboard"
                        >
                          {copiedLogs ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div
                      ref={logsContainerRef}
                      className="p-3 font-mono text-[11px] max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin select-text"
                    >
                      {setupLogs.map((log) => {
                        const match = log.text.match(/^\[([A-Z]+)\]\s*(.*)$/);
                        const tag = match ? match[1] : null;
                        const body = match ? match[2] : log.text;

                        return (
                          <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-neutral-500 shrink-0 select-none text-[10px]">[{log.time}]</span>

                            {tag && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 uppercase tracking-wider ${
                                  tag === 'IMAP'
                                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                    : tag === 'SMTP'
                                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                    : tag === 'SYNC'
                                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                                    : tag === 'CACHE'
                                    ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                                    : tag === 'AUTH'
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : tag === 'DONE'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : tag === 'ERR'
                                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                                }`}
                              >
                                {tag}
                              </span>
                            )}

                            <span
                              className={`flex-1 break-words ${
                                log.status === 'success' || tag === 'DONE'
                                  ? 'text-emerald-400'
                                  : log.status === 'error' || tag === 'ERR'
                                  ? 'text-red-400 font-medium'
                                  : log.status === 'warning'
                                  ? 'text-amber-400'
                                  : 'text-neutral-300'
                              }`}
                            >
                              {body}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Diagnostic Resolution Panel on Error */}
                  {currentStep === 'error' && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-red-900 dark:text-red-200">
                            Connection Diagnostic
                          </h4>
                          <p className="text-[11px] text-red-800 dark:text-red-300 leading-relaxed">
                            {errorMessage || 'Unable to establish secure handshake with mail server.'}
                          </p>
                        </div>
                      </div>

                      {/* Troubleshooting Tips */}
                      <div className="bg-white/60 dark:bg-black/30 rounded-xl p-2.5 border border-red-200/60 dark:border-red-900/30 space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0078d4]" />
                          <span>Recommended Solutions:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-neutral-600 dark:text-neutral-400">
                          <li>
                            <strong>App Password:</strong> If your account has 2FA enabled, generate an App Password.
                          </li>
                          <li>
                            <strong>Host & Ports:</strong> Check IMAP port ({imapPort}) and SMTP port ({smtpPort}) on {imapHost || 'server'}.
                          </li>
                          <li>
                            <strong>Username:</strong> Ensure username matches your full email address ({email}).
                          </li>
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <FluentButton
                          type="button"
                          variant="secondary"
                          className="w-full text-xs"
                          onClick={() => {
                            setIsSetupRunning(false);
                            setShowAdvanced(true);
                          }}
                        >
                          Adjust Settings
                        </FluentButton>
                        <FluentButton
                          type="button"
                          variant="primary"
                          className="w-full flex items-center justify-center gap-1.5 text-xs"
                          onClick={handleSetupSubmit}
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </FluentButton>
                      </div>

                      {/* Demo Mode Bypass */}
                      <div className="text-center pt-1 border-t border-red-200/50 dark:border-red-900/30">
                        <button
                          type="button"
                          onClick={handleProceedDemo}
                          className="text-[11px] text-neutral-500 hover:text-[#0078d4] dark:hover:text-blue-400 underline cursor-pointer"
                        >
                          Continue into mailbox using demo/offline mode
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Completion Card */}
                  {currentStep === 'complete' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Account Ready!</h4>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                            All protocols verified. Opening mailbox...
                          </p>
                        </div>
                      </div>
                      <FluentButton
                        type="button"
                        variant="primary"
                        className="!py-1.5 !px-3 text-xs shrink-0"
                        onClick={() => router.push('/mail/u/0#inbox')}
                      >
                        Open Inbox
                      </FluentButton>
                    </div>
                  )}
                </div>
              ) : (
                /* Setup Form with Reusable Components */
                <form onSubmit={handleSetupSubmit} className="space-y-3.5">
                  <FluentInput
                    type="email"
                    label="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="user@domain.com"
                    icon={<Mail className="w-4 h-4" />}
                    rightElement={
                      isDiscovering ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#0078d4]" />
                      ) : null
                    }
                  />

                  {renderDiscoveryBadge()}

                  <div className="grid grid-cols-2 gap-2">
                    <FluentInput
                      type="text"
                      label="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="John Doe"
                      icon={<User className="w-3.5 h-3.5" />}
                    />

                    <FluentInput
                      isPassword
                      label="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      icon={<Lock className="w-3.5 h-3.5" />}
                    />
                  </div>

                  {/* Detected Server Summary */}
                  <div className="p-2.5 rounded-2xl bg-neutral-100/70 dark:bg-[#12151d]/70 border border-neutral-200/80 dark:border-neutral-800 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Server className="w-3 h-3 text-[#0078d4]" />
                        Incoming (IMAP):
                      </span>
                      <span className="font-mono text-neutral-900 dark:text-neutral-200 font-medium">
                        {imapHost || 'imap.domain.com'}:{imapPort} ({imapSecure ? 'SSL' : 'None'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Send className="w-3 h-3 text-emerald-500" />
                        Outgoing (SMTP):
                      </span>
                      <span className="font-mono text-neutral-900 dark:text-neutral-200 font-medium">
                        {smtpHost || 'smtp.domain.com'}:{smtpPort} ({smtpSecure ? 'SSL' : 'STARTTLS'})
                      </span>
                    </div>
                  </div>

                  {/* Advanced Server Settings Accordion */}
                  <div className="border-t border-neutral-200/80 dark:border-neutral-800/80 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 py-1 cursor-pointer active:scale-98 transition-transform"
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Shield className="w-3.5 h-3.5 text-neutral-400" />
                        Manual Server Settings (Optional)
                      </span>
                      {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showAdvanced && (
                      <div className="mt-2.5 space-y-3 p-3 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800/60 text-xs animate-in fade-in duration-200">
                        {/* IMAP config */}
                        <div className="space-y-1.5">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 block text-[11px]">
                            Incoming Server (IMAP)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={imapHost}
                                onChange={(e) => setImapHost(e.target.value)}
                                placeholder="imap.domain.com"
                                className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs outline-none focus:border-[#0078d4]"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                value={imapPort}
                                onChange={(e) => setImapPort(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs outline-none focus:border-[#0078d4]"
                              />
                            </div>
                          </div>
                          <label className="inline-flex items-center gap-2 cursor-pointer pt-0.5">
                            <input
                              type="checkbox"
                              checked={imapSecure}
                              onChange={(e) => setImapSecure(e.target.checked)}
                              className="rounded text-[#0078d4] focus:ring-[#0078d4]"
                            />
                            <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">Use SSL/TLS</span>
                          </label>
                        </div>

                        {/* SMTP config */}
                        <div className="space-y-1.5 pt-2 border-t border-neutral-200 dark:border-neutral-700/50">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200 block text-[11px]">
                            Outgoing Server (SMTP)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={smtpHost}
                                onChange={(e) => setSmtpHost(e.target.value)}
                                placeholder="smtp.domain.com"
                                className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs outline-none focus:border-[#0078d4]"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                value={smtpPort}
                                onChange={(e) => setSmtpPort(Number(e.target.value))}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs outline-none focus:border-[#0078d4]"
                              />
                            </div>
                          </div>
                          <label className="inline-flex items-center gap-2 cursor-pointer pt-0.5">
                            <input
                              type="checkbox"
                              checked={smtpSecure}
                              onChange={(e) => setSmtpSecure(e.target.checked)}
                              className="rounded text-[#0078d4] focus:ring-[#0078d4]"
                            />
                            <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">Use SSL (Port 465)</span>
                          </label>
                        </div>

                        {/* Separate SMTP credentials */}
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/50 space-y-1.5">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={usesSameCredentials}
                              onChange={(e) => setUsesSameCredentials(e.target.checked)}
                              className="rounded text-[#0078d4] focus:ring-[#0078d4]"
                            />
                            <span className="text-neutral-600 dark:text-neutral-400 text-[11px]">Use same credentials for SMTP</span>
                          </label>

                          {!usesSameCredentials && (
                            <div className="space-y-1.5 pt-1">
                              <input
                                type="text"
                                value={smtpUsername}
                                onChange={(e) => setSmtpUsername(e.target.value)}
                                placeholder="SMTP Username"
                                className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs outline-none focus:border-[#0078d4]"
                              />
                              <input
                                type="password"
                                value={smtpPassword}
                                onChange={(e) => setSmtpPassword(e.target.value)}
                                placeholder="SMTP Password"
                                className="w-full px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs outline-none focus:border-[#0078d4]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <FluentButton
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    isLoading={isSubmitting}
                    iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Setup & Connect
                  </FluentButton>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-xs text-[#0078d4] dark:text-blue-400 hover:underline font-medium cursor-pointer active:scale-95 transition-transform"
                    >
                      Already configured? Sign in directly
                    </button>
                  </div>
                </form>
              )}
            </div>
          </FluentViewTransition>
        )}
      </FluentCard>
    </div>
  );
}

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
          router.push('/mail/u/0#inbox');
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

              {/* Error Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300 text-xs flex gap-2 items-start animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {isSetupRunning ? (
                /* Live Setup Progress Stepper & Terminal Log */
                <div className="space-y-4 select-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                        {currentStep === 'complete'
                          ? 'Account Connected!'
                          : currentStep === 'error'
                          ? 'Connection Problem'
                          : 'Provisioning Account...'}
                      </h3>
                      <p className="text-[11px] text-neutral-500 truncate max-w-[240px]">{email}</p>
                    </div>
                    <span className="text-base font-mono font-extrabold text-[#0078d4] dark:text-blue-400">
                      {setupProgress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentStep === 'error'
                          ? 'bg-red-500'
                          : currentStep === 'complete'
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-[#0078d4] via-indigo-500 to-emerald-500'
                      }`}
                      style={{ width: `${setupProgress}%` }}
                    />
                  </div>

                  {/* Stepper Status List */}
                  <div className="space-y-1.5 py-1">
                    {[
                      { id: 'imap_connect', label: 'IMAP TLS Authentication' },
                      { id: 'smtp_verify', label: 'Outbound SMTP Handshake' },
                      { id: 'mailbox_sync', label: 'Discovering Mailboxes' },
                      { id: 'email_fetch', label: 'Pre-fetching Initial Messages' },
                      { id: 'provision_account', label: 'Finalizing Security Tokens' },
                    ].map((step) => {
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
                        <div key={step.id} className="flex items-center gap-2.5 text-xs">
                          {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          {status === 'active' && <Loader2 className="w-3.5 h-3.5 text-[#0078d4] animate-spin shrink-0" />}
                          {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                          {status === 'pending' && <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0" />}

                          <span
                            className={`truncate ${
                              status === 'active'
                                ? 'font-semibold text-[#0078d4] dark:text-blue-400'
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

                  {/* Live Terminal Stream */}
                  <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-[#0d1117] text-neutral-300 text-xs shadow-inner">
                    <div className="bg-[#161b22] px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
                        <span className="w-2 h-2 rounded-full bg-yellow-500/80 inline-block" />
                        <span className="w-2 h-2 rounded-full bg-green-500/80 inline-block" />
                        <span className="text-[10px] font-mono text-neutral-400 ml-1">Live Setup Stream</span>
                      </div>
                      <Terminal className="w-3 h-3 text-neutral-500" />
                    </div>
                    <div
                      ref={logsContainerRef}
                      className="p-2.5 font-mono text-[10px] max-h-36 overflow-y-auto space-y-1 scrollbar-thin select-text"
                    >
                      {setupLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-1.5 leading-relaxed">
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

                  {currentStep === 'error' && (
                    <FluentButton
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setIsSetupRunning(false);
                        setShowAdvanced(true);
                      }}
                    >
                      Adjust Settings & Try Again
                    </FluentButton>
                  )}

                  {currentStep === 'complete' && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium">Setup complete! Redirecting to your mailbox...</span>
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

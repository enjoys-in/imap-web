'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Copy, Check, X, KeyRound, Clock, ShieldAlert } from 'lucide-react';
import { detectOtpCode, DetectedOtp } from '@/lib/otpParser';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

interface ReadingPaneOtpBannerProps {
  emailId?: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
}

export function ReadingPaneOtpBanner({
  emailId,
  subject,
  bodyText,
  bodyHtml,
}: ReadingPaneOtpBannerProps) {
  const [copied, setCopied] = useState(false);
  const [dismissedEmailId, setDismissedEmailId] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  // Reset copy state when email changes
  useEffect(() => {
    setCopied(false);
  }, [emailId]);

  const otp = useMemo<DetectedOtp | null>(() => {
    return detectOtpCode(subject, bodyText, bodyHtml);
  }, [subject, bodyText, bodyHtml]);

  if (!otp || (emailId && dismissedEmailId === emailId)) {
    return null;
  }

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(otp.code);
      } else {
        // Fallback for older environments
        const input = document.createElement('textarea');
        input.value = otp.code;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }

      setCopied(true);
      addToast({
        title: 'Verification code copied',
        description: `Code ${otp.formattedCode} copied to clipboard`,
        type: 'success',
        duration: 3000,
      });

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      addToast({
        title: 'Copy failed',
        description: 'Unable to access clipboard. Please copy manually.',
        type: 'error',
      });
    }
  };

  return (
    <div className="mx-4 my-2.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-neutral-50/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-neutral-900/60 p-3.5 shadow-xs transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Shield icon & title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-blue-100 dark:ring-blue-950/70">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                {otp.label || 'Security Verification Code'}
              </span>
              {otp.expiresIn && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-900/60">
                  <Clock className="w-3 h-3" />
                  Expires in {otp.expiresIn}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
              One-click copy for quick sign-in & authentication. Never share this code.
            </p>
          </div>
        </div>

        {/* Right: Code Display & Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div
            onClick={handleCopy}
            title="Click to copy code"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700 shadow-2xs cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors select-all group"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-mono text-base sm:text-lg font-black tracking-[0.2em] text-neutral-900 dark:text-neutral-100">
              {otp.formattedCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'px-3.5 py-1.5 h-9 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer',
              copied
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          {emailId && (
            <button
              type="button"
              onClick={() => setDismissedEmailId(emailId)}
              title="Dismiss code banner"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

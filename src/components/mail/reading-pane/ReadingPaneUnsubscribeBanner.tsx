'use client';

import React, { useState, useMemo } from 'react';
import { Mailbox, ExternalLink, Check, X, BellOff, AlertTriangle } from 'lucide-react';
import { detectUnsubscribe, DetectedUnsubscribe } from '@/lib/unsubscribeParser';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

interface ReadingPaneUnsubscribeBannerProps {
  emailId: string;
  fromAddress?: string;
  fromName?: string;
  bodyHtml?: string;
  bodyText?: string;
}

export function ReadingPaneUnsubscribeBanner({
  emailId,
  fromAddress,
  fromName,
  bodyHtml,
  bodyText,
}: ReadingPaneUnsubscribeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const unsubInfo = useMemo<DetectedUnsubscribe | null>(() => {
    return detectUnsubscribe(fromAddress, fromName, bodyHtml, bodyText);
  }, [fromAddress, fromName, bodyHtml, bodyText]);

  if (!unsubInfo || isDismissed) return null;

  const handleConfirmUnsubscribe = () => {
    setShowConfirmModal(false);
    setIsUnsubscribed(true);

    if (unsubInfo.type === 'mailto') {
      window.location.href = unsubInfo.target;
    } else {
      window.open(unsubInfo.target, '_blank', 'noopener,noreferrer');
    }

    addToast({
      title: 'Unsubscribe requested',
      description: `Unsubscribe link opened for ${unsubInfo.senderName}.`,
      type: 'success',
    });
  };

  return (
    <>
      <div className="mx-4 my-2 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-300">
        <div className="flex items-center gap-2 min-w-0">
          <BellOff className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate">
            This message is from a newsletter or mailing list.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isUnsubscribed ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" />
              Unsubscribe requested
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="text-[#0078d4] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Unsubscribe
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 rounded cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Unsubscribe from {unsubInfo.senderName}?
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  We will open the sender&apos;s official unsubscribe page so you can opt out of future emails.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3 h-8 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnsubscribe}
                className="px-3.5 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Unsubscribe</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

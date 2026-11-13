'use client';

import React, { useEffect, useRef } from 'react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { useAlertStore, AlertType } from '@/stores/useAlertStore';
import { cn } from '@/lib/utils';

export interface AlertDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
}

const TYPE_CONFIG = {
  info: {
    icon: Info,
    iconColor: 'text-[#0078d4] dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900',
    btnClass: 'bg-[#0078d4] hover:bg-[#106ebe] text-white',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900',
    btnClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  confirm: {
    icon: HelpCircle,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900',
    btnClass: 'bg-[#0078d4] hover:bg-[#106ebe] text-white',
  },
};

/**
 * Reusable Alert & Confirmation Dialog Component
 */
export function AlertDialog({
  open,
  title,
  description,
  type = 'info',
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}: AlertDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  const isConfirmation = type === 'confirm' || Boolean(cancelText);

  // Focus confirm button & listen to Escape key
  useEffect(() => {
    if (!open) return;
    confirmBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel?.();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel?.();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header with Type Icon & Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs',
                cfg.iconBg
              )}
            >
              <Icon className={cn('w-5 h-5', cfg.iconColor)} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              onCancel?.();
              onClose();
            }}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description Body */}
        {description && (
          <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed pl-12 whitespace-pre-line">
            {description}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {isConfirmation && (
            <button
              type="button"
              onClick={() => {
                onCancel?.();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {cancelText || 'Cancel'}
            </button>
          )}
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs',
              cfg.btnClass
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Global Alert Dialog connected to useAlertStore.
 * Mount this once in the root AppShell layout.
 */
export function GlobalAlertDialog() {
  const isOpen = useAlertStore((s) => s.isOpen);
  const options = useAlertStore((s) => s.options);
  const closeAlert = useAlertStore((s) => s.closeAlert);

  if (!isOpen || !options) return null;

  return (
    <AlertDialog
      open={isOpen}
      title={options.title}
      description={options.description}
      type={options.type}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      onConfirm={() => closeAlert(true)}
      onCancel={() => closeAlert(false)}
      onClose={() => closeAlert(false)}
    />
  );
}

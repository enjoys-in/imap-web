'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, FolderPlus, X } from 'lucide-react';
import { useAlertStore, AlertType } from '@/stores/useAlertStore';
import { cn } from '@/lib/utils';
export { GlobalAlertDialog } from './GlobalAlertDialog';

export interface AlertDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
  label?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
  onClose: () => void;
}

const TYPE_CONFIG: Record<AlertType, { icon: React.ElementType; iconColor: string; iconBg: string; btnClass: string }> = {
  info: { icon: Info, iconColor: 'text-[#0078d4] dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900', btnClass: 'bg-[#0078d4] hover:bg-[#106ebe] text-white' },
  success: { icon: CheckCircle2, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900', btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  warning: { icon: AlertTriangle, iconColor: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900', btnClass: 'bg-amber-600 hover:bg-amber-700 text-white' },
  error: { icon: AlertCircle, iconColor: 'text-red-600 dark:text-red-400', iconBg: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900', btnClass: 'bg-red-600 hover:bg-red-700 text-white' },
  confirm: { icon: HelpCircle, iconColor: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900', btnClass: 'bg-[#0078d4] hover:bg-[#106ebe] text-white' },
  prompt: { icon: FolderPlus, iconColor: 'text-[#0078d4] dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900', btnClass: 'bg-[#0078d4] hover:bg-[#106ebe] text-white' },
};

export function AlertDialog({
  open, title, description, type = 'info', confirmText = 'OK', cancelText,
  placeholder = 'Enter value...', defaultValue = '', label, onConfirm, onCancel, onClose,
}: AlertDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;
  const isConfirmation = type === 'confirm' || type === 'prompt' || Boolean(cancelText);

  useEffect(() => {
    if (!open) return;
    setInputValue(defaultValue);
    const timer = setTimeout(() => {
      if (type === 'prompt' && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
      else confirmBtnRef.current?.focus();
    }, 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCancel?.(); onClose(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { clearTimeout(timer); window.removeEventListener('keydown', handleKeyDown); };
  }, [open, onClose, onCancel, defaultValue, type]);

  if (!open) return null;

  const handleConfirmAction = () => {
    if (type === 'prompt') onConfirm?.(inputValue.trim());
    else onConfirm?.();
    onClose();
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) { onCancel?.(); onClose(); } }}
    >
      <div className="w-full max-w-sm bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs', cfg.iconBg, cfg.iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{title}</h3>
          </div>
          <button
            type="button"
            onClick={() => { onCancel?.(); onClose(); }}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {description && <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line pl-0.5">{description}</div>}

        {type === 'prompt' ? (
          <form onSubmit={(e) => { e.preventDefault(); handleConfirmAction(); }} className="space-y-4">
            <div>
              {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{label}</label>}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#181818] text-neutral-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 focus:border-[#0078d4]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => { onCancel?.(); onClose(); }}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {cancelText || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={cn('px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50', cfg.btnClass)}
              >
                {confirmText}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            {isConfirmation && (
              <button
                type="button"
                onClick={() => { onCancel?.(); onClose(); }}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {cancelText || 'Cancel'}
              </button>
            )}
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={handleConfirmAction}
              className={cn('px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs', cfg.btnClass)}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, FolderPlus, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PromptDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  errorMessage?: string | null;
  required?: boolean;
  validate?: (value: string) => string | null | undefined;
  onConfirm: (value: string) => void | Promise<void>;
  onClose: () => void;
}

export function PromptDialog({
  open, title, description, label, placeholder = 'Enter name...', defaultValue = '',
  confirmText = 'OK', cancelText = 'Cancel', icon, isLoading = false,
  errorMessage = null, required = true, validate, onConfirm, onClose,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setLocalError(null);
      setIsSubmitting(false);
      const timer = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, defaultValue]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, isSubmitting, isLoading]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (required && !trimmed) { setLocalError('This field cannot be empty.'); inputRef.current?.focus(); return; }
    if (validate) {
      const err = validate(trimmed);
      if (err) { setLocalError(err); inputRef.current?.focus(); return; }
    }
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(trimmed);
    } catch (err: any) {
      setLocalError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLoading = isLoading || isSubmitting;
  const displayError = localError || errorMessage;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget && !activeLoading) onClose();
      }}
    >
      <div className="w-full max-w-sm max-h-full overflow-y-auto bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-4 sm:p-5 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 text-[#0078d4] dark:text-blue-400 shadow-2xs">
              {icon || <FolderPlus className="w-5 h-5" />}
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{title}</h3>
          </div>
          <button
            type="button"
            disabled={activeLoading}
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {description && (
          <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line pl-0.5">{description}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">{label}</label>}
            <input
              ref={inputRef}
              type="text"
              disabled={activeLoading}
              value={value}
              onChange={(e) => { setValue(e.target.value); if (localError) setLocalError(null); }}
              placeholder={placeholder}
              className={cn(
                'w-full min-w-0 text-xs text-ellipsis px-3 py-2 rounded-lg border bg-neutral-50 dark:bg-[#181818] text-neutral-900 dark:text-white transition-all',
                'focus:outline-none focus:ring-2 focus:ring-[#0078d4]/50 focus:border-[#0078d4]',
                displayError ? 'border-red-500 dark:border-red-500/80' : 'border-neutral-300 dark:border-neutral-700'
              )}
            />
            {displayError && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{displayError}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-end">
            <button
              type="button"
              disabled={activeLoading}
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg whitespace-nowrap text-center border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={activeLoading || (required && !value.trim())}
              className="px-4 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold bg-[#0078d4] hover:bg-[#106ebe] text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {activeLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

'use client';

import React from 'react';
import { useToastStore, ToastItem } from '@/stores/useToastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function getToastIcon(type?: string) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
    default:
      return <Info className="w-4 h-4 text-[#0078d4] shrink-0" />;
  }
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast: ToastItem) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto p-3.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-2'
          )}
        >
          {getToastIcon(toast.type)}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                {toast.description}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

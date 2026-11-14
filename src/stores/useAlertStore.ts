'use client';

import React from 'react';
import { create } from 'zustand';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'prompt';

export interface AlertOptions {
  title: string;
  description?: React.ReactNode;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  placeholder?: string;
  defaultValue?: string;
  label?: string;
  required?: boolean;
  onConfirm?: (value?: string | boolean) => void;
  onCancel?: () => void;
}

interface AlertState {
  isOpen: boolean;
  options: AlertOptions | null;
  resolver: ((val: any) => void) | null;
  showAlert: (options: AlertOptions | string) => Promise<boolean>;
  showConfirm: (options: AlertOptions | string) => Promise<boolean>;
  showPrompt: (options: AlertOptions | string) => Promise<string | null>;
  closeAlert: (confirmed?: boolean, value?: string) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  isOpen: false,
  options: null,
  resolver: null,

  showAlert: (options) => {
    return new Promise((resolve) => {
      const opts: AlertOptions =
        typeof options === 'string'
          ? { title: 'Alert', description: options, type: 'info' }
          : { type: 'info', ...options };

      set({
        isOpen: true,
        options: opts,
        resolver: resolve,
      });
    });
  },

  showConfirm: (options) => {
    return new Promise((resolve) => {
      const opts: AlertOptions =
        typeof options === 'string'
          ? {
              title: 'Confirm',
              description: options,
              type: 'confirm',
              cancelText: 'Cancel',
              confirmText: 'Confirm',
            }
          : {
              type: 'confirm',
              cancelText: 'Cancel',
              confirmText: 'Confirm',
              ...options,
            };

      set({
        isOpen: true,
        options: opts,
        resolver: resolve,
      });
    });
  },

  showPrompt: (options) => {
    return new Promise((resolve) => {
      const opts: AlertOptions =
        typeof options === 'string'
          ? {
              title: 'Prompt',
              description: options,
              type: 'prompt',
              cancelText: 'Cancel',
              confirmText: 'OK',
            }
          : {
              type: 'prompt',
              cancelText: 'Cancel',
              confirmText: 'OK',
              ...options,
            };

      set({
        isOpen: true,
        options: opts,
        resolver: resolve,
      });
    });
  },

  closeAlert: (confirmed = false, value?: string) => {
    const { options, resolver } = get();
    if (confirmed) {
      if (options?.type === 'prompt') {
        const resultVal = value !== undefined ? value : options.defaultValue || '';
        options.onConfirm?.(resultVal);
        resolver?.(resultVal);
      } else {
        options?.onConfirm?.(true);
        resolver?.(true);
      }
    } else {
      options?.onCancel?.();
      resolver?.(options?.type === 'prompt' ? null : false);
    }
    set({ isOpen: false, options: null, resolver: null });
  },
}));

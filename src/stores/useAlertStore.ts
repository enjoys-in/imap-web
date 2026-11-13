'use client';

import React from 'react';
import { create } from 'zustand';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertOptions {
  title: string;
  description?: React.ReactNode;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertState {
  isOpen: boolean;
  options: AlertOptions | null;
  resolver: ((val: boolean) => void) | null;
  showAlert: (options: AlertOptions | string) => Promise<boolean>;
  showConfirm: (options: AlertOptions | string) => Promise<boolean>;
  closeAlert: (confirmed?: boolean) => void;
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

  closeAlert: (confirmed = false) => {
    const { options, resolver } = get();
    if (confirmed) {
      options?.onConfirm?.();
      resolver?.(true);
    } else {
      options?.onCancel?.();
      resolver?.(false);
    }
    set({ isOpen: false, options: null, resolver: null });
  },
}));

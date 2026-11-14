'use client';

import React from 'react';
import { useAlertStore } from '@/stores/useAlertStore';
import { AlertDialog } from './AlertDialog';

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
      placeholder={options.placeholder}
      defaultValue={options.defaultValue}
      label={options.label}
      onConfirm={(val) => closeAlert(true, val)}
      onCancel={() => closeAlert(false)}
      onClose={() => closeAlert(false)}
    />
  );
}

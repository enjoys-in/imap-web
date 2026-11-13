'use client';

import { useMailActionListener } from '@/hooks/useMailActionListener';

/**
 * Headless controller mounted in AppShell to listen for and handle all
 * 'airsend:mail-action' custom events from header bars, context menus, and shortcuts.
 */
export function MailActionController() {
  useMailActionListener();
  return null;
}

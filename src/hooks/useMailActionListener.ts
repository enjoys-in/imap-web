'use client';

import { useEffect, useCallback } from 'react';
import { MAIL_ACTION_EVENT, MailActionEventDetail } from '@/lib/events/mailActionEvents';
import { dispatchMailAction } from './mailActionDispatcher';

export function useMailActionListener() {
  const handleMailAction = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<MailActionEventDetail>;
    if (customEvent.detail) {
      dispatchMailAction(customEvent.detail);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener(MAIL_ACTION_EVENT, handleMailAction);
    return () => {
      window.removeEventListener(MAIL_ACTION_EVENT, handleMailAction);
    };
  }, [handleMailAction]);
}

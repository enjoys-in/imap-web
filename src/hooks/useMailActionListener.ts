'use client';

import { useEffect, useCallback } from 'react';
import { MAIL_ACTION_EVENT, MailActionEventDetail } from '@/lib/events/mailActionEvents';
import { dispatchMailAction } from './mailActionDispatcher';
import { useToastStore } from '@/stores';

export function useMailActionListener() {
  const handleMailAction = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<MailActionEventDetail>;
    if (customEvent.detail) {
      dispatchMailAction(customEvent.detail);
    }
  }, []);

  const handleToastEvent = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<any>;
    if (customEvent.detail) {
      useToastStore.getState().addToast(customEvent.detail);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener(MAIL_ACTION_EVENT, handleMailAction);
    window.addEventListener('airsend:toast', handleToastEvent);
    return () => {
      window.removeEventListener(MAIL_ACTION_EVENT, handleMailAction);
      window.removeEventListener('airsend:toast', handleToastEvent);
    };
  }, [handleMailAction, handleToastEvent]);
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useComposeStore } from '@/stores/useComposeStore';
import { useMailStore } from '@/stores/useMailStore';
import { saveCachedEmails } from '@/lib/idb/mailCacheDb';
import { emailsApi } from '@/lib/api';
import { findRegisteredSpecialFolder } from '@/lib/folders';
import { useSession } from '@/components/providers/SessionProvider';
import { MailMessage } from '@/types';

export function useComposeDraftSync(containerRef: React.RefObject<HTMLDivElement | null>) {
  const {
    isOpen, mode, to, cc, bcc, subject, body, attachments,
    originalMessageId, threadId, draftId, draftStatus,
    updateFields,
  } = useComposeStore();
  const { user, account } = useSession();

  const isFocusedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedHashRef = useRef('');
  const prevAttachmentsCountRef = useRef(attachments.length);

  const getHash = useCallback(() => {
    return [to, cc, bcc, subject, body, attachments.map((a) => `${a.name}-${a.size}`).join(',')].join(':::');
  }, [to, cc, bcc, subject, body, attachments]);

  const hasContent = useCallback(() => {
    return Boolean(to.trim() || subject.trim() || body.trim() || attachments.length > 0);
  }, [to, subject, body, attachments]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const saveDraft = useCallback(async (isImmediateAttachment = false) => {
    clearTimers();
    if (!hasContent()) return;

    updateFields({ draftStatus: 'saving' });
    const isReplyOrForward = mode === 'reply' || mode === 'replyAll' || mode === 'forward';
    const currentDraftId = draftId || `draft-${Date.now()}`;

    const accountId = useMailStore.getState().selectedAccountId;
    const draftMsg: MailMessage = {
      id: currentDraftId,
      // The account's Drafts folder as classified by the backend.
      folderId: findRegisteredSpecialFolder('Drafts', accountId)?.id ?? '',
      accountId,
      uid: Math.floor(Math.random() * 10000),
      threadId: isReplyOrForward && threadId ? threadId : `draft-thread-${Date.now()}`,
      inReplyTo: isReplyOrForward ? originalMessageId : undefined,
      subject: subject.trim() || '(No subject)',
      fromName: user?.display_name || account?.displayName || '',
      fromAddress: user?.email || account?.email || '',
      to: to.trim() || '',
      cc: cc.trim() || undefined,
      bcc: bcc.trim() || undefined,
      date: new Date().toISOString(),
      size: (body?.length || 0) + attachments.reduce((acc, a) => acc + a.size, 0) + 512,
      preview: body ? body.slice(0, 80) : '(Draft message)',
      bodyText: body,
      bodyHtml: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
      isRead: true,
      isFlagged: false,
      isPinned: false,
      isAnswered: false,
      isForwarded: false,
      isDraft: true,
      isThread: Boolean(isReplyOrForward && threadId),
      conversationType: isReplyOrForward && threadId ? 'thread' : 'single',
      hasAttachments: attachments.length > 0,
      hasCalendar: false,
      isBodyDownloaded: true,
    };

    // 1. Optimistic local mail store
    const { localEmails } = useMailStore.getState();
    const existingIndex = localEmails.findIndex((e) => e.id === currentDraftId);
    if (existingIndex >= 0) {
      const updated = [...localEmails];
      updated[existingIndex] = draftMsg;
      useMailStore.setState({ localEmails: updated });
    } else {
      useMailStore.setState({ localEmails: [draftMsg, ...localEmails] });
    }

    // 2. Offline IDB cache
    saveCachedEmails([draftMsg]);

    // 3. Backend IMAP/REST Sync
    try {
      const res = await emailsApi.saveDraft({
        id: currentDraftId,
        to: to.trim(),
        cc: cc.trim(),
        bcc: bcc.trim(),
        subject: subject.trim(),
        bodyText: body,
        bodyHtml: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
        attachments: attachments.map((a) => ({ name: a.name, size: a.size, type: a.type })),
      });
      if (res?.id) {
        updateFields({ draftId: res.id });
      }
    } catch (err) {
      console.warn('[Draft sync error, persisted locally]', err);
    }

    lastSavedHashRef.current = getHash();
    updateFields({
      draftId: currentDraftId,
      draftStatus: 'saved',
      lastSavedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }, [hasContent, clearTimers, updateFields, mode, draftId, threadId, originalMessageId, subject, to, cc, bcc, body, attachments, getHash, user, account]);

  // Handle focus/blur events on compose modal container
  const handleFocusCapture = useCallback(() => {
    isFocusedRef.current = true;
    clearTimers();
    if (draftStatus === 'countdown') {
      updateFields({ draftStatus: draftId ? 'saved' : 'idle', draftCountdown: 3 });
    }
  }, [clearTimers, draftStatus, draftId, updateFields]);

  const handleBlurCapture = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (containerRef.current && e.relatedTarget && containerRef.current.contains(e.relatedTarget as Node)) {
      return; // Still focused inside compose modal
    }
    if (useComposeStore.getState().isAttaching) {
      return; // Attaching file dialog is active
    }

    isFocusedRef.current = false;
    if (!hasContent() || getHash() === lastSavedHashRef.current) {
      return;
    }

    clearTimers();
    updateFields({ draftStatus: 'countdown', draftCountdown: 3 });

    let count = 3;
    intervalRef.current = setInterval(() => {
      count -= 1;
      updateFields({ draftCountdown: count });
      if (count <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    timerRef.current = setTimeout(() => {
      clearTimers();
      if (!isFocusedRef.current) {
        saveDraft(false);
      }
    }, 3000);
  }, [containerRef, hasContent, getHash, clearTimers, updateFields, saveDraft]);

  // "but in case of upload or attach then case diffrent" -> immediate save on attachment added
  useEffect(() => {
    if (!isOpen) return;
    if (attachments.length > prevAttachmentsCountRef.current) {
      prevAttachmentsCountRef.current = attachments.length;
      saveDraft(true);
    } else {
      prevAttachmentsCountRef.current = attachments.length;
    }
  }, [attachments.length, isOpen, saveDraft]);

  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    handleFocusCapture,
    handleBlurCapture,
    saveDraft,
  };
}

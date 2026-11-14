'use client';

import React, { useRef } from 'react';
import { useComposeStore, useMailStore, useToastStore } from '@/stores';
import { useUndoSendStore } from '@/stores/useUndoSendStore';
import { invalidateFolderSync } from '@/lib/idb/mailCacheDb';
import { emailsApi } from '@/lib/api';
import { findRegisteredSpecialFolder } from '@/lib/folders';
import { ComposeHeader } from './ComposeHeader';
import { ComposeToolbar } from './ComposeToolbar';
import { ComposeFields } from './ComposeFields';
import { ComposeEditor } from './ComposeEditor';
import { useComposeDraftSync } from './useComposeDraftSync';
import { useSession } from '@/components/providers/SessionProvider';
import { cn } from '@/lib/utils';
import { MailMessage } from '@/types';

export function ComposeModal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isOpen = useComposeStore((s) => s.isOpen);
  const isMinimized = useComposeStore((s) => s.isMinimized);
  const isMaximized = useComposeStore((s) => s.isMaximized);
  const mode = useComposeStore((s) => s.mode);
  const to = useComposeStore((s) => s.to);
  const cc = useComposeStore((s) => s.cc);
  const bcc = useComposeStore((s) => s.bcc);
  const subject = useComposeStore((s) => s.subject);
  const body = useComposeStore((s) => s.body);
  const attachments = useComposeStore((s) => s.attachments);
  const originalMessageId = useComposeStore((s) => s.originalMessageId);
  const threadId = useComposeStore((s) => s.threadId);
  const draftId = useComposeStore((s) => s.draftId);
  const close = useComposeStore((s) => s.close);
  const startPendingSend = useUndoSendStore((s) => s.startPendingSend);

  const { user, account } = useSession();
  const { handleFocusCapture, handleBlurCapture } = useComposeDraftSync(containerRef);

  if (!isOpen) return null;

  const title =
    mode === 'new'
      ? 'New message'
      : mode === 'reply'
      ? `RE: ${subject}`
      : mode === 'replyAll'
      ? `RE: ${subject}`
      : `FW: ${subject}`;

  const handleSend = () => {
    const isReplyOrForward = mode === 'reply' || mode === 'replyAll' || mode === 'forward';
    const resolvedThreadId = isReplyOrForward && threadId ? threadId : `thread-${Date.now()}`;

    // Clean up draft if this compose had a saved draft
    if (draftId) {
      // Removes the draft locally and asks the server to delete it from its own folder.
      useMailStore.getState().deleteEmail(draftId);
    }

    const accountId = useMailStore.getState().selectedAccountId;
    const newMsg: MailMessage = {
      id: `sent-${Date.now()}`,
      // The account's Sent folder as classified by the backend.
      folderId: findRegisteredSpecialFolder('Sent', accountId)?.id ?? '',
      accountId,
      uid: Math.floor(Math.random() * 10000),
      threadId: resolvedThreadId,
      inReplyTo: isReplyOrForward ? originalMessageId : undefined,
      subject: subject || '(No subject)',
      fromName: user?.display_name || account?.displayName || '',
      fromAddress: user?.email || account?.email || '',
      to,
      date: new Date().toISOString(),
      size: body.length + 1024,
      preview: body.slice(0, 80),
      bodyText: body,
      bodyHtml: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
      isRead: true,
      isFlagged: false,
      isPinned: false,
      isAnswered: false,
      isForwarded: false,
      isDraft: false,
      isThread: Boolean(isReplyOrForward && threadId),
      conversationType: isReplyOrForward && threadId ? 'thread' : 'single',
      hasAttachments: attachments.length > 0,
      hasCalendar: false,
      isBodyDownloaded: true,
    };

    close();

    startPendingSend(
      { id: newMsg.id, to, cc, bcc, subject, body, message: newMsg },
      (msg) => {
        const currentEmails = useMailStore.getState().localEmails;
        const updatedList = currentEmails.map((e) =>
          e.threadId === resolvedThreadId
            ? { ...e, isThread: true, threadCount: (e.threadCount || 1) + 1, conversationType: 'thread' as const }
            : e
        );
        useMailStore.setState({ localEmails: [msg, ...updatedList] });
        // The sent message exists on the server with its own uid: have Sent fetch again when it is opened.
        if (msg.folderId) void invalidateFolderSync(msg.folderId);

        const toRecipients = to.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
        const ccRecipients = cc ? cc.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined;
        const bccRecipients = bcc ? bcc.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined;

        emailsApi
          .sendEmail({
            to: toRecipients.length > 0 ? toRecipients : to,
            cc: ccRecipients,
            bcc: bccRecipients,
            subject: subject || '(No subject)',
            bodyText: body,
            bodyHtml: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
            replyToMessageId: isReplyOrForward ? originalMessageId : undefined,
          })
          .then((res) => {
            useToastStore.getState().addToast({
              title: res.success ? 'Message Sent' : 'Delivery Notice',
              description: res.message || 'Email sent successfully',
              type: res.success ? 'success' : 'warning',
            });
          })
          .catch((err) => {
            console.error('[SendEmail error]', err);
            useToastStore.getState().addToast({
              title: 'Sending Failed',
              description: err?.message || 'Failed to dispatch email.',
              type: 'error',
            });
          });
      }
    );
  };

  return (
    <div
      ref={containerRef}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      className={cn(
        'fixed z-50 transition-all duration-150 flex flex-col shadow-2xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900',
        isMaximized
          ? 'inset-0 md:inset-8 md:rounded-lg'
          : isMinimized
          ? 'bottom-14 md:bottom-0 right-2 md:right-10 w-72 h-9 rounded-t-lg'
          : 'inset-0 md:inset-auto md:bottom-0 md:right-10 md:w-[580px] md:h-[520px] md:rounded-t-lg'
      )}
    >
      <ComposeHeader title={title} />

      {!isMinimized && (
        <>
          <ComposeToolbar onSend={handleSend} />
          <ComposeFields />
          <ComposeEditor />
        </>
      )}
    </div>
  );
}

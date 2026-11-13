'use client';

import React from 'react';
import { useComposeStore, useMailStore } from '@/stores';
import { useUndoSendStore } from '@/stores/useUndoSendStore';
import { saveCachedEmails } from '@/lib/idb/mailCacheDb';
import { emailsApi } from '@/lib/api';
import { ComposeHeader } from './ComposeHeader';
import { ComposeToolbar } from './ComposeToolbar';
import { ComposeFields } from './ComposeFields';
import { ComposeEditor } from './ComposeEditor';
import { cn } from '@/lib/utils';
import { MailMessage } from '@/types';

export function ComposeModal() {
  const isOpen = useComposeStore((s) => s.isOpen);
  const isMinimized = useComposeStore((s) => s.isMinimized);
  const isMaximized = useComposeStore((s) => s.isMaximized);
  const mode = useComposeStore((s) => s.mode);
  const to = useComposeStore((s) => s.to);
  const cc = useComposeStore((s) => s.cc);
  const bcc = useComposeStore((s) => s.bcc);
  const subject = useComposeStore((s) => s.subject);
  const body = useComposeStore((s) => s.body);
  const originalMessageId = useComposeStore((s) => s.originalMessageId);
  const threadId = useComposeStore((s) => s.threadId);
  const close = useComposeStore((s) => s.close);
  const startPendingSend = useUndoSendStore((s) => s.startPendingSend);

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

    const newMsg: MailMessage = {
      id: `sent-${Date.now()}`,
      folderId: 'fld-sent',
      accountId: 'acc-1',
      uid: Math.floor(Math.random() * 10000),
      threadId: resolvedThreadId,
      inReplyTo: isReplyOrForward ? originalMessageId : undefined,
      subject: subject || '(No subject)',
      fromName: 'Alex Morgan',
      fromAddress: 'alex.morgan@contoso.com',
      to: to || 'recipient@contoso.com',
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
      hasAttachments: false,
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
        saveCachedEmails([msg]);

        const toRecipients = to.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
        const ccRecipients = cc ? cc.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined;
        const bccRecipients = bcc ? bcc.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined;

        emailsApi.sendEmail({
          to: toRecipients.length > 0 ? toRecipients : to,
          cc: ccRecipients,
          bcc: bccRecipients,
          subject: subject || '(No subject)',
          bodyText: body,
          bodyHtml: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
          replyToMessageId: isReplyOrForward ? originalMessageId : undefined,
        }).catch((err) => {
          console.error('[SendEmail error]', err);
        });
      }
    );
  };

  return (
    <div
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

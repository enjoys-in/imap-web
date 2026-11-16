'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useComposeStore, useMailStore, useToastStore } from '@/stores';
import { useUndoSendStore } from '@/stores/useUndoSendStore';
import { invalidateFolderSync } from '@/lib/idb/mailCacheDb';
import { emailsApi } from '@/lib/api';
import { findRegisteredSpecialFolder } from '@/lib/folders';
import { toOutgoingAttachments } from '@/lib/attachmentFiles';
import { shouldWarnMissingAttachment } from '@/lib/attachmentDetector';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { AlertTriangle, Paperclip } from 'lucide-react';
import { ComposeHeader } from './ComposeHeader';
import { ComposeToolbar } from './ComposeToolbar';
import { ComposeFields } from './ComposeFields';
import { ComposeEditor } from './ComposeEditor';
import { useComposeDraftSync } from './useComposeDraftSync';
import { useSession } from '@/components/providers/SessionProvider';
import { cn } from '@/lib/utils';
import { MailMessage } from '@/types';
import { format } from 'date-fns';

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

  const [showMissingAttachmentAlert, setShowMissingAttachmentAlert] = useState(false);
  const [pendingArchiveSend, setPendingArchiveSend] = useState(false);

  if (!isOpen) return null;

  const title =
    mode === 'new'
      ? 'New message'
      : mode === 'editDraft'
      ? 'Edit draft'
      : mode === 'reply'
      ? `RE: ${subject}`
      : mode === 'replyAll'
      ? `RE: ${subject}`
      : `FW: ${subject}`;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addAttachment = useComposeStore((s) => s.addAttachment);

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => addAttachment(file));
      e.target.value = '';
    }
    setShowMissingAttachmentAlert(false);
  };

  const executeSend = (archive = false) => {
    const isReplyOrForward = mode === 'reply' || mode === 'replyAll' || mode === 'forward';
    const resolvedThreadId = isReplyOrForward && threadId ? threadId : `thread-${Date.now()}`;

    const accountId = useMailStore.getState().selectedAccountId;

    // Clean up draft if this compose had a saved draft
    if (draftId) {
      useMailStore.getState().deleteEmail(draftId, findRegisteredSpecialFolder('Drafts', accountId)?.id);
    }

    const newMsg: MailMessage = {
      id: `sent-${Date.now()}`,
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

    if (archive && originalMessageId) {
      dispatchMailAction({ action: 'archive', targetEmailId: originalMessageId });
    }

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
        if (msg.folderId) void invalidateFolderSync(msg.folderId);

        const toRecipients = to.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
        const ccRecipients = cc ? cc.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined;
        const bccRecipients = bcc ? bcc.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined;

        toOutgoingAttachments(attachments)
          .then((outgoingAttachments) =>
            emailsApi.sendEmail({
              to: toRecipients.length > 0 ? toRecipients : to,
              cc: ccRecipients,
              bcc: bccRecipients,
              subject: subject || '(No subject)',
              bodyText: body,
              bodyHtml: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
              attachments: outgoingAttachments,
              replyToMessageId: isReplyOrForward ? originalMessageId : undefined,
            })
          )
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

  const handleSend = () => {
    if (shouldWarnMissingAttachment(subject, body, attachments.length)) {
      setPendingArchiveSend(false);
      setShowMissingAttachmentAlert(true);
      return;
    }
    executeSend(false);
  };

  const handleSendAndArchive = () => {
    if (shouldWarnMissingAttachment(subject, body, attachments.length)) {
      setPendingArchiveSend(true);
      setShowMissingAttachmentAlert(true);
      return;
    }
    executeSend(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSendAndArchive();
        } else {
          handleSend();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, subject, body, attachments.length]);

  const handleScheduleSend = (scheduledTime: Date) => {
    const accountId = useMailStore.getState().selectedAccountId;
    if (draftId) {
      useMailStore.getState().deleteEmail(draftId, findRegisteredSpecialFolder('Drafts', accountId)?.id);
    }
    close();

    useToastStore.getState().addToast({
      title: 'Email Scheduled',
      description: `Your message to ${to || 'recipient'} will be sent on ${format(scheduledTime, 'EEEE, MMM d, yyyy h:mm a')}.`,
      type: 'success',
      duration: 5500,
    });
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
          <ComposeToolbar
            onSend={handleSend}
            onScheduleSend={handleScheduleSend}
            onSendAndArchive={
              mode === 'reply' || mode === 'replyAll' || mode === 'forward'
                ? handleSendAndArchive
                : undefined
            }
          />
          <ComposeFields />
          <ComposeEditor />
        </>
      )}

      {/* Hidden file input for missing attachment trigger */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFilePicked}
      />

      {/* Missing Attachment Warning Dialog */}
      {showMissingAttachmentAlert && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Did you forget to attach a file?
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  You mentioned an attachment in your message, but haven&apos;t attached any files yet.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setShowMissingAttachmentAlert(false);
                  executeSend(pendingArchiveSend);
                }}
                className="px-3 h-8 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Send Anyway
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

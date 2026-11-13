'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Mail, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { useMailStore, useComposeStore } from '@/stores';
import { emailsApi } from '@/api';
import { MailMessage, MailMessageMetadata } from '@/types';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { format } from 'date-fns';
import { ReadingPaneHeader } from './ReadingPaneHeader';
import { ReadingPaneSecurityBanner } from './ReadingPaneSecurityBanner';
import { ReadingPaneAttachments } from './ReadingPaneAttachments';
import { SandboxedEmailBody } from './SandboxedEmailBody';
import { MultiSelectReadingPane } from './MultiSelectReadingPane';
import { QuickReplyChips } from './QuickReplyChips';

interface ReadingPaneProps {
  activeMailId?: string;
  onBack?: () => void;
}

export function ReadingPane({ activeMailId, onBack }: ReadingPaneProps) {
  const selectedMailId = useMailStore((s) => s.selectedMailId);
  const selectedIds = useMailStore((s) => s.selectedIds);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const localEmails = useMailStore((s) => s.localEmails);
  const toggleFlag = useMailStore((s) => s.toggleFlag);
  const deleteEmail = useMailStore((s) => s.deleteEmail);

  const openReply = useComposeStore((s) => s.openReply);
  const openForward = useComposeStore((s) => s.openForward);

  const [allowExternalImages, setAllowExternalImages] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);
  const [canvasLight, setCanvasLight] = useState(false);
  const [fetchedBody, setFetchedBody] = useState<{ bodyHtml?: string; bodyText?: string } | null>(null);
  const [isBodyLoading, setIsBodyLoading] = useState(false);
  const [fallbackEmail, setFallbackEmail] = useState<MailMessage | null>(null);
  const [threadMessages, setThreadMessages] = useState<MailMessage[]>([]);
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([]);

  const folderEmailIds = useMemo(() => {
    return localEmails
      .filter((m) => (!selectedFolderId || selectedFolderId === 'fld-inbox' ? !m.folderId || m.folderId === 'fld-inbox' : m.folderId === selectedFolderId))
      .map((e) => e.id);
  }, [localEmails, selectedFolderId]);

  const currentId = activeMailId || selectedMailId;
  const emailInStore = localEmails.find((e) => e.id === currentId);

  // If email is not directly in local store (e.g. sub-thread message clicked or direct link), fetch it
  useEffect(() => {
    if (!currentId) return;
    if (emailInStore) {
      setFallbackEmail(null);
      return;
    }
    let isCancelled = false;
    emailsApi.getEmailById(currentId).then((found) => {
      if (!isCancelled && found) {
        setFallbackEmail(found);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [currentId, emailInStore]);

  const email = (emailInStore || fallbackEmail) as (MailMessage | MailMessageMetadata | undefined);

  // Fetch full email body for the current active message
  useEffect(() => {
    if (!currentId) return;
    let isCancelled = false;
    setIsBodyLoading(true);
    emailsApi.getEmailBody(currentId).then((body) => {
      if (!isCancelled) {
        setFetchedBody(body);
        setIsBodyLoading(false);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [currentId]);

  // Fetch full thread messages whenever threadId is active
  useEffect(() => {
    if (!email?.threadId) {
      setThreadMessages([]);
      return;
    }
    let isCancelled = false;
    emailsApi.getThreadMessages(email.threadId).then((messages) => {
      if (!isCancelled) {
        setThreadMessages(messages);
        setExpandedHistoryIds(messages.map((m) => m.id));
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [email?.threadId]);

  const historyMessages = useMemo(() => {
    if (!threadMessages.length) return [];
    return threadMessages.filter((m) => m.id !== currentId);
  }, [threadMessages, currentId]);

  const handleReply = useCallback(() => {
    if (email) openReply(email, false);
  }, [email, openReply]);

  const handleReplyAll = useCallback(() => {
    if (email) openReply(email, true);
  }, [email, openReply]);

  const handleForward = useCallback(() => {
    if (email) openForward(email);
  }, [email, openForward]);

  const handleDelete = useCallback(() => {
    if (email) {
      deleteEmail(email.id);
      if (onBack) onBack();
    }
  }, [email, deleteEmail, onBack]);

  const handleToggleFlag = useCallback(() => {
    if (email) toggleFlag(email.id);
  }, [email, toggleFlag]);

  if (selectedIds.length > 1) {
    return (
      <MultiSelectReadingPane
        folderName={selectedFolderId === 'fld-inbox' ? 'Inbox' : 'current'}
        folderEmailIds={folderEmailIds}
      />
    );
  }

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 select-none bg-white dark:bg-[#1f1f1f] transition-colors">
        <Mail className="w-12 h-12 stroke-[1.2] text-neutral-300 dark:text-neutral-700 mb-2" />
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Select an item to read
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">Nothing is selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1f1f1f] text-neutral-900 dark:text-neutral-100 overflow-hidden transition-colors">
      <ReadingPaneHeader
        email={email}
        onBack={onBack}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
        onDelete={handleDelete}
        onToggleFlag={handleToggleFlag}
        hideHistory={hideHistory}
        onToggleHistory={() => setHideHistory((prev) => !prev)}
        onToggleCanvas={() => setCanvasLight((v) => !v)}
      />

      <ReadingPaneSecurityBanner
        isContentAllowed={allowExternalImages}
        onShowBlockedContent={() => setAllowExternalImages(true)}
      />

      <ReadingPaneAttachments attachments={email.attachments} />

      <div className="flex-1 overflow-y-auto">
        {isBodyLoading ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
            <div className="h-28 bg-neutral-200 dark:bg-neutral-800 rounded w-full mt-4" />
          </div>
        ) : (
          <SandboxedEmailBody
            bodyHtml={fetchedBody?.bodyHtml || ''}
            bodyText={fetchedBody?.bodyText || ''}
            allowExternalImages={allowExternalImages}
          />
        )}

        <QuickReplyChips email={email} />

        {/* Conversation Thread History Section */}
        <div className="p-4 pt-2">
          <button
            type="button"
            onClick={() => setHideHistory((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0078d4] hover:text-[#106ebe] dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer select-none"
          >
            {hideHistory ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>
              {hideHistory
                ? `Show message history${historyMessages.length > 0 ? ` (${historyMessages.length})` : ''}`
                : `Hide message history${historyMessages.length > 0 ? ` (${historyMessages.length})` : ''}`}
            </span>
          </button>
        </div>

        {!hideHistory && historyMessages.length > 0 && (
          <div className="px-4 pb-6 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-1">
              <MessageSquare className="w-3 h-3 text-[#0078d4]" />
              <span>Earlier messages in conversation</span>
            </div>

            {historyMessages.map((histMsg) => {
              const isExpanded = expandedHistoryIds.includes(histMsg.id);
              const histDate = format(new Date(histMsg.date), 'EEE M/d/yyyy h:mm a');
              const senderName = histMsg.fromName || histMsg.fromAddress;

              return (
                <div
                  key={histMsg.id}
                  className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-50/70 dark:bg-neutral-800/40 shadow-2xs"
                >
                  <div
                    onClick={() => {
                      setExpandedHistoryIds((prev) =>
                        prev.includes(histMsg.id) ? prev.filter((id) => id !== histMsg.id) : [...prev, histMsg.id]
                      );
                    }}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BimiAvatar
                        name={senderName}
                        email={histMsg.fromAddress}
                        explicitLogo={histMsg.bimiLogoUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {senderName}
                          </span>
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate hidden sm:inline">
                            &lt;{histMsg.fromAddress}&gt;
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          to {histMsg.to}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs text-neutral-400">
                      <span className="text-[11px] font-medium hidden sm:inline">{histDate}</span>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f]">
                      <ReadingPaneAttachments attachments={histMsg.attachments} />
                      <SandboxedEmailBody
                        bodyHtml={histMsg.bodyHtml || ''}
                        bodyText={histMsg.bodyText || histMsg.preview}
                        allowExternalImages={allowExternalImages}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

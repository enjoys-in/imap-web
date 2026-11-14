'use client';
import { getRegisteredFolder, findRegisteredSpecialFolder } from '@/lib/folders';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Mail, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { useMailStore, useComposeStore } from '@/stores';
import { emailsApi } from '@/lib/api';
import { MailMessage, MailMessageMetadata } from '@/types';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { format } from 'date-fns';
import { ReadingPaneHeader } from './ReadingPaneHeader';
import { ReadingPaneSecurityBanner } from './ReadingPaneSecurityBanner';
import { ReadingPaneAttachments } from './ReadingPaneAttachments';
import { SandboxedEmailBody } from './SandboxedEmailBody';
import { MultiSelectReadingPane } from './MultiSelectReadingPane';
import { QuickReplyChips } from './QuickReplyChips';
import { ReadingPaneDraftBanner } from './ReadingPaneDraftBanner';
import { isDraftMessage } from '@/lib/draftUtils';
import { openDraftForEditing } from '@/lib/openDraft';
import { useSession } from '@/components/providers/SessionProvider';
import { formatRecipientsWithYou, getUserEmails } from '@/lib/recipientUtils';
import { cn } from '@/lib/utils';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';

interface ReadingPaneProps {
  activeMailId?: string;
  onBack?: () => void;
}

function getInitialBody(id?: string | null, bodyHtml?: string, bodyText?: string) {
  if (!id) return null;
  if (bodyHtml || bodyText) {
    return { bodyHtml, bodyText };
  }
  return null;
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

  const currentId = activeMailId || selectedMailId;
  const { account, accounts } = useSession();
  const myEmails = useMemo(() => getUserEmails(account?.email, accounts), [account?.email, accounts]);
  const emailInStore = localEmails.find((e) => e.id === currentId);
  const [fallbackEmail, setFallbackEmail] = useState<MailMessage | null>(null);

  const email = (emailInStore || fallbackEmail) as (MailMessage | MailMessageMetadata | undefined);
  const hasEmailInStore = Boolean(emailInStore);
  const emailFolderId = email?.folderId;
  const inlineBodyHtml = email && 'bodyHtml' in email ? email.bodyHtml : undefined;
  const inlineBodyText = email && 'bodyText' in email ? email.bodyText : undefined;
  const initialBody = useMemo(
    () => getInitialBody(currentId, inlineBodyHtml, inlineBodyText),
    [currentId, inlineBodyHtml, inlineBodyText]
  );

  const [allowExternalImages, setAllowExternalImages] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);
  const [canvasLight, setCanvasLight] = useState(false);
  const [fetchedBody, setFetchedBody] = useState<{ bodyHtml?: string; bodyText?: string } | null>(initialBody);
  const [isBodyLoading, setIsBodyLoading] = useState(false);
  const [isOpeningDraft, setIsOpeningDraft] = useState(false);
  const [threadMessages, setThreadMessages] = useState<MailMessage[]>([]);
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<string[]>([]);

  const folderEmailIds = useMemo(() => {
    return localEmails
      .filter((m) => m.folderId === selectedFolderId)
      .map((e) => e.id);
  }, [localEmails, selectedFolderId]);

  useEffect(() => {
    if (!currentId) return;
    if (hasEmailInStore) {
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
  }, [currentId, hasEmailInStore]);

  // Fetch full email body for the current active message (instant if already in memory)
  useEffect(() => {
    if (!currentId) return;
    if (initialBody) {
      setFetchedBody(initialBody);
      setIsBodyLoading(false);
      return;
    }
    let isCancelled = false;
    setIsBodyLoading(true);
    emailsApi
      .getEmailBody(currentId, emailFolderId)
      .then((body) => {
        if (!isCancelled) {
          setFetchedBody(body);
          setIsBodyLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setFetchedBody(null);
          setIsBodyLoading(false);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [currentId, emailFolderId, initialBody]);

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

  const messageOrder = useGeneralSettingsStore((s) => s.messageOrder);
  const showDeletedItems = useGeneralSettingsStore((s) => s.showDeletedItems);

  const historyMessages = useMemo(() => {
    if (!threadMessages.length) return [];
    const filtered = threadMessages.filter((m) => {
      if (m.id === currentId) return false;
      const trashId = findRegisteredSpecialFolder('Trash', m.accountId)?.id;
      if (!showDeletedItems && ((trashId && m.folderId === trashId) || (m as { isDeleted?: boolean }).isDeleted)) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return messageOrder === 'newestOnTop' ? timeB - timeA : timeA - timeB;
    });
  }, [threadMessages, currentId, messageOrder, showDeletedItems]);

  const handleReply = useCallback(() => {
    if (email) openReply(email, false);
  }, [email, openReply]);

  const handleReplyAll = useCallback(() => {
    if (email) openReply(email, true);
  }, [email, openReply]);

  const handleForward = useCallback(() => {
    if (email) openForward(email);
  }, [email, openForward]);

  const handleEditDraft = useCallback(async () => {
    if (!email) return;
    setIsOpeningDraft(true);
    await openDraftForEditing(email);
    setIsOpeningDraft(false);
  }, [email]);

  const handleDelete = useCallback(() => {
    if (email) {
      dispatchMailAction({ action: 'delete', targetEmailId: email.id, targetEmail: email });
      if (onBack) onBack();
    }
  }, [email, onBack]);

  const handleToggleFlag = useCallback(() => {
    if (email) {
      dispatchMailAction({ action: 'toggle-flag', targetEmailId: email.id, targetEmail: email });
    }
  }, [email]);

  if (selectedIds.length > 1) {
    return (
      <MultiSelectReadingPane
        folderName={getRegisteredFolder(selectedFolderId)?.displayName ?? 'current'}
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

      {isDraftMessage(email) && (
        <ReadingPaneDraftBanner isLoading={isOpeningDraft} onEdit={handleEditDraft} />
      )}

      <ReadingPaneSecurityBanner
        isContentAllowed={allowExternalImages}
        onShowBlockedContent={() => setAllowExternalImages(true)}
      />

      <ReadingPaneAttachments
        attachments={email.attachments}
        folder={email.folderId}
        uid={email.uid || email.id}
      />

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
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-250 ease-in-out', hideHistory && '-rotate-90')} />
            <span>
              {hideHistory
                ? `Show message history${historyMessages.length > 0 ? ` (${historyMessages.length})` : ''}`
                : `Hide message history${historyMessages.length > 0 ? ` (${historyMessages.length})` : ''}`}
            </span>
          </button>
        </div>

        {/* Smooth Collapsible History Container */}
        {historyMessages.length > 0 && (
          <div
            className={cn(
              'grid transition-all duration-300 ease-in-out',
              !hideHistory ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            )}
          >
            <div className="overflow-hidden">
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
                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-neutral-100/70 dark:hover:bg-neutral-800/80 transition-colors"
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
                              to {formatRecipientsWithYou(histMsg.to, myEmails)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-xs text-neutral-400">
                          <span className="text-[11px] font-medium hidden sm:inline">{histDate}</span>
                          <ChevronDown
                            className={cn(
                              'w-3.5 h-3.5 transition-transform duration-250 ease-in-out',
                              !isExpanded && '-rotate-90'
                            )}
                          />
                        </div>
                      </div>

                      {/* Smooth Collapsible Historical Message Body */}
                      <div
                        className={cn(
                          'grid transition-all duration-300 ease-in-out',
                          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f]">
                            <ReadingPaneAttachments
                              attachments={histMsg.attachments}
                              folder={histMsg.folderId || email.folderId}
                              uid={histMsg.uid || histMsg.id}
                            />
                            <SandboxedEmailBody
                              bodyHtml={histMsg.bodyHtml || ''}
                              bodyText={histMsg.bodyText || histMsg.preview}
                              allowExternalImages={allowExternalImages}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

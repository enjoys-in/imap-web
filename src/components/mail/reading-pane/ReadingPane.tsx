'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { useMailStore, useComposeStore } from '@/stores';
import { emailsApi } from '@/api';
import { ReadingPaneHeader } from './ReadingPaneHeader';
import { ReadingPaneSecurityBanner } from './ReadingPaneSecurityBanner';
import { ReadingPaneAttachments } from './ReadingPaneAttachments';
import { SandboxedEmailBody } from './SandboxedEmailBody';
import { MultiSelectReadingPane } from './MultiSelectReadingPane';

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

  const folderEmailIds = useMemo(() => {
    return localEmails
      .filter((m) => (!selectedFolderId || selectedFolderId === 'fld-inbox' ? !m.folderId || m.folderId === 'fld-inbox' : m.folderId === selectedFolderId))
      .map((e) => e.id);
  }, [localEmails, selectedFolderId]);

  const currentId = activeMailId || selectedMailId;
  const email = localEmails.find((e) => e.id === currentId);

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

        <div className="p-4 pt-2">
          <button
            onClick={() => setHideHistory((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-[#0078d4] hover:text-[#106ebe] dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            {hideHistory ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{hideHistory ? 'Show message history' : 'Hide message history'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

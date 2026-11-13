'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CornerUpLeft, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useMailStore, useComposeStore } from '@/stores';
import { emailsApi } from '@/api';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { SandboxedEmailBody } from './SandboxedEmailBody';
import { ReadingPaneAttachments } from './ReadingPaneAttachments';
import { format } from 'date-fns';
import { MailMessage, MailMessageMetadata } from '@/types';
import { folderIdToSlug, slugToFolderId } from '@/lib/folderSlugUtils';

interface ThreadConversationViewProps {
  mailId: string;
}

export function ThreadConversationView({ mailId }: ThreadConversationViewProps) {
  const localEmails = useMailStore((s) => s.localEmails);
  const deleteEmail = useMailStore((s) => s.deleteEmail);
  const openReply = useComposeStore((s) => s.openReply);
  const addOrSelectEmail = useMailStore((s) => s.addOrSelectEmail);

  const [expandedIds, setExpandedIds] = useState<string[]>([mailId]);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [threadBodies, setThreadBodies] = useState<Record<string, string>>({});
  const [fetchedEmail, setFetchedEmail] = useState<MailMessage | null>(null);
  const [threadList, setThreadList] = useState<MailMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [backPath, setBackPath] = useState('/mail/u/0/#inbox');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const slug = hash ? folderIdToSlug(slugToFolderId(hash)) : 'inbox';
      setBackPath(`/mail/u/0/#${slug}`);
    }
  }, []);

  const targetEmail = localEmails.find((e) => e.id === mailId) || fetchedEmail;
  const localThreadMessages = localEmails.filter(
    (e) => e.threadId === targetEmail?.threadId || e.id === targetEmail?.id
  );
  const activeThread = threadList.length > 0 ? threadList : localThreadMessages;

  useEffect(() => {
    if (!targetEmail && mailId) {
      setIsSearching(true);
      emailsApi.getEmailById(mailId).then((found) => {
        setIsSearching(false);
        if (found) {
          setFetchedEmail(found);
          addOrSelectEmail(found);
        }
      });
    }
  }, [targetEmail, mailId, addOrSelectEmail]);

  useEffect(() => {
    if (!targetEmail?.threadId) return;
    emailsApi.getThreadMessages(targetEmail.threadId).then((msgs) => {
      if (msgs.length > 0) {
        setThreadList(msgs);
        setExpandedIds((prev) => Array.from(new Set([...prev, ...msgs.map((m) => m.id)])));
      }
    });
  }, [targetEmail?.threadId]);

  useEffect(() => {
    if (!targetEmail) return;
    emailsApi.getEmailBody(targetEmail.id).then((b) => {
      if (b.bodyHtml) setThreadBodies((prev) => ({ ...prev, [targetEmail.id]: b.bodyHtml || '' }));
    });
  }, [targetEmail]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleQuickSend = () => {
    if (!quickReplyText.trim() || !targetEmail) return;
    openReply(targetEmail, false);
    setQuickReplyText('');
  };

  if (!targetEmail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-400">
        <p>{isSearching ? 'Loading conversation thread...' : 'Email message not found.'}</p>
        <Link href={backPath} className="px-3 py-1.5 rounded bg-[#0078d4] text-white text-xs mt-3">
          Return to mailbox
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-y-auto">
      <div className="p-3 md:p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={backPath} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-300" title="Back to mailbox">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-xl">{targetEmail.subject}</h1>
            <span className="text-[11px] text-neutral-500">{activeThread.length || 1} {activeThread.length === 1 ? 'message' : 'messages'} in conversation</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => openReply(targetEmail, false)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer" title="Reply"><CornerUpLeft className="w-4 h-4" /></button>
          <button onClick={() => deleteEmail(targetEmail.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer" title="Delete thread"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="p-4 space-y-3 max-w-4xl w-full mx-auto">
        {(activeThread.length > 0 ? activeThread : [targetEmail]).map((msg: MailMessageMetadata | MailMessage) => {
          const isExpanded = expandedIds.includes(msg.id);
          const sentDate = format(new Date(msg.date), 'MMM d, h:mm a');
          const bodyContent = threadBodies[msg.id] || ('bodyHtml' in msg ? msg.bodyHtml : '');

          return (
            <div key={msg.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-50/40 dark:bg-neutral-800/30 shadow-xs">
              <div onClick={() => toggleExpand(msg.id)} className="p-3 flex items-center justify-between cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/60 transition-colors select-none">
                <div className="flex items-center gap-2.5">
                  <BimiAvatar name={msg.fromName || msg.fromAddress} email={msg.fromAddress} explicitLogo={msg.bimiLogoUrl} size="sm" />
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{msg.fromName || msg.fromAddress}</span>
                    <span className="text-[11px] text-neutral-500 ml-2">to {msg.to}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{sentDate}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <ReadingPaneAttachments attachments={msg.attachments} />
                  <SandboxedEmailBody bodyHtml={bodyContent} allowExternalImages={true} />
                </div>
              )}
            </div>
          );
        })}

        <div className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 space-y-2 mt-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
            <CornerUpLeft className="w-3.5 h-3.5" />
            <span>Reply to {targetEmail.fromName || targetEmail.fromAddress}</span>
          </div>
          <textarea value={quickReplyText} onChange={(e) => setQuickReplyText(e.target.value)} placeholder="Write a quick reply..." rows={3} className="w-full text-xs p-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#0078d4]" />
          <div className="flex justify-end">
            <button onClick={handleQuickSend} className="h-7 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer">
              <Send className="w-3.5 h-3.5" />
              <span>Send reply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Paperclip, Mail, ExternalLink } from 'lucide-react';
import { useMailStore } from '@/stores/useMailStore';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { formatDistanceToNow } from 'date-fns';

interface ProfileRecentMessagesProps {
  contactName: string;
  contactEmail: string;
  onSelectMessage?: (msgId: string) => void;
}

export function ProfileRecentMessages({
  contactName,
  contactEmail,
  onSelectMessage,
}: ProfileRecentMessagesProps) {
  const localEmails = useMailStore((s) => s.localEmails);

  const matched = localEmails.filter(
    (e) =>
      e.fromAddress.toLowerCase().includes(contactEmail.toLowerCase()) ||
      e.fromName.toLowerCase().includes(contactName.toLowerCase()) ||
      contactEmail.toLowerCase().includes(e.fromAddress.toLowerCase())
  );

  const displayList = matched.length > 0 ? matched : localEmails.slice(0, 3);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Messages</h4>
          <p className="text-xs text-neutral-500">Recent messages with {contactName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {displayList.slice(0, 3).map((msg) => (
          <div
            key={msg.id}
            onClick={() => onSelectMessage && onSelectMessage(msg.id)}
            className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-[#0078d4] dark:hover:border-[#0078d4] transition-all cursor-pointer shadow-xs group flex flex-col justify-between h-40"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <BimiAvatar name={msg.fromName || msg.fromAddress} email={msg.fromAddress} explicitLogo={msg.bimiLogoUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#0078d4] transition-colors">
                      {msg.subject}
                    </span>
                    {msg.hasAttachments && <Paperclip className="w-3 h-3 text-neutral-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-neutral-400 block">{formatDistanceToNow(new Date(msg.date), { addSuffix: true })}</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                {msg.preview}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
              <span className="flex items-center gap-1 text-[#0078d4]">
                <Mail className="w-3 h-3" />
                <span>From {msg.fromName || msg.fromAddress}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="text-xs text-[#0078d4] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
      >
        <span>Show more messages</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sun, CornerUpLeft, ReplyAll, CornerUpRight, LayoutGrid,
  MoreHorizontal, ChevronDown, ChevronUp, Printer, Flag, Trash2
} from 'lucide-react';
import { MailMessage, MailMessageMetadata } from '@/types';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { ProfileCardModal, ProfileContactData } from '@/components/profile/ProfileCardModal';
import { ReadingPaneHeaderDetails } from './ReadingPaneHeaderDetails';
import { format } from 'date-fns';

interface ReadingPaneHeaderProps {
  email: MailMessage | MailMessageMetadata;
  onBack?: () => void;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onDelete: () => void;
  onToggleFlag: () => void;
  hideHistory?: boolean;
  onToggleHistory?: () => void;
  onToggleCanvas?: () => void;
}

export function ReadingPaneHeader({
  email,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onToggleFlag,
  onToggleCanvas,
}: ReadingPaneHeaderProps) {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [profileContact, setProfileContact] = useState<ProfileContactData | null>(null);

  const formattedDate = format(new Date(email.date), 'EEE M/d/yyyy h:mm a');
  const senderName = email.fromName || email.fromAddress;

  const handleOpenProfile = (name: string, addr: string) => {
    setProfileContact({
      name,
      email: addr,
      phone: '+91 98765 43210',
      company: addr.split('@')[1] || 'Tech Corp',
      bimiLogoUrl: email.bimiLogoUrl,
    });
  };

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 select-none transition-colors p-3 md:p-4">
      {/* Top Row: Subject */}
      <h1 className="text-base md:text-xl font-bold text-neutral-900 dark:text-white tracking-tight mb-3 truncate">
        {email.subject || '(No subject)'}
      </h1>

      {/* Main Sender & Actions Row matching Screenshot 1 */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: BIMI Avatar + Sender Name & To info */}
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={() => handleOpenProfile(senderName, email.fromAddress)}
            className="cursor-pointer transition-transform hover:scale-105 shrink-0"
            title="View Profile Card"
          >
            <BimiAvatar
              name={senderName}
              email={email.fromAddress}
              explicitLogo={email.bimiLogoUrl}
              size="md"
              className="w-9 h-9"
            />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenProfile(senderName, email.fromAddress)}
                className="font-bold text-xs md:text-sm text-neutral-900 dark:text-white hover:text-[#0078d4] dark:hover:text-[#5599dd] hover:underline cursor-pointer transition-colors truncate"
              >
                {senderName}
              </button>
              <span className="text-neutral-500 text-xs truncate">&lt;{email.fromAddress}&gt;</span>
            </div>

            {/* To: line with toggle to view Cc/Bcc and headers */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              <span>To:</span>
              <button
                type="button"
                onClick={() => handleOpenProfile('You', email.to)}
                className="font-medium text-neutral-800 dark:text-neutral-200 hover:underline cursor-pointer"
              >
                {email.to.includes('mullayam') ? 'You' : email.to}
              </button>

              <button
                type="button"
                onClick={() => setIsHeaderExpanded((v) => !v)}
                className="p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded cursor-pointer ml-1"
                title={isHeaderExpanded ? 'Hide header details' : 'Show details (Cc, Bcc, headers)'}
              >
                {isHeaderExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Action Icons matching Screenshot 1 */}
        <div className="flex flex-col items-end shrink-0 gap-1">
          <div className="flex items-center gap-0.5 text-neutral-600 dark:text-neutral-300">
            <button onClick={onToggleCanvas} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer" title="Toggle canvas theme">
              <Sun className="w-4 h-4 text-sky-400 dark:text-sky-300" />
            </button>
            <button onClick={onReply} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer text-purple-400 dark:text-purple-300" title="Reply">
              <CornerUpLeft className="w-4 h-4" />
            </button>
            <button onClick={onReplyAll} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer text-purple-400 dark:text-purple-300 hidden sm:inline-flex" title="Reply all">
              <ReplyAll className="w-4 h-4" />
            </button>
            <button onClick={onForward} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer text-cyan-400 dark:text-cyan-300" title="Forward">
              <CornerUpRight className="w-4 h-4" />
            </button>
            <Link href={`/mail/view/${email.id}#${email.folderId || 'fld-inbox'}`} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors text-blue-500 dark:text-blue-400" title="Open in new window">
              <LayoutGrid className="w-4 h-4" />
            </Link>

            {/* More actions menu */}
            <div className="relative">
              <button onClick={() => setIsMoreOpen((v) => !v)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer" title="More actions">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {isMoreOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMoreOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-[#383838] rounded-md shadow-2xl py-1 z-40 text-xs">
                    <button onClick={() => { window.print(); setIsMoreOpen(false); }} className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-[#333333] flex items-center gap-2 cursor-pointer">
                      <Printer className="w-3.5 h-3.5" /><span>Print</span>
                    </button>
                    <button onClick={() => { onToggleFlag(); setIsMoreOpen(false); }} className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-[#333333] flex items-center gap-2 cursor-pointer">
                      <Flag className="w-3.5 h-3.5" /><span>{email.isFlagged ? 'Clear flag' : 'Flag message'}</span>
                    </button>
                    <button onClick={() => { onDelete(); setIsMoreOpen(false); }} className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Expandable Cc / Bcc / Full Mail Headers */}
      {isHeaderExpanded && (
        <ReadingPaneHeaderDetails email={email} formattedDate={formattedDate} />
      )}

      {/* Profile Card Modal */}
      <ProfileCardModal
        contact={profileContact}
        isOpen={Boolean(profileContact)}
        onClose={() => setProfileContact(null)}
      />
    </div>
  );
}

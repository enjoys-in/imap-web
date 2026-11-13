'use client';

import React from 'react';
import { FileText, Check, CheckCheck, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from './useChatState';

interface ChatMessageItemProps {
  message: ChatMessage;
  onReact: (messageId: string, emoji: string) => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '🚀', '🎉', '👀'];

export function ChatMessageItem({ message, onReact }: ChatMessageItemProps) {
  const { isMe, senderName, senderAvatar, content, timestamp, status, reactions, attachments } = message;

  return (
    <div className={cn('flex gap-3 group relative mb-4', isMe ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {isMe ? (
          <div className="w-8 h-8 rounded-full bg-[#0078d4] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            You
          </div>
        ) : senderAvatar ? (
          <img src={senderAvatar} alt={senderName} className="w-8 h-8 rounded-full object-cover shadow-xs" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center font-bold text-xs">
            {senderName.charAt(0)}
          </div>
        )}
      </div>

      {/* Bubble Container */}
      <div className={cn('flex flex-col max-w-[70%]', isMe ? 'items-end' : 'items-start')}>
        {/* Sender Name & Timestamp */}
        <div className={cn('flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">{isMe ? 'You' : senderName}</span>
          <span>{timestamp}</span>
          {isMe && status && (
            <span title={status} className="text-neutral-400">
              {status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#0078d4]" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            'p-3 rounded-2xl text-xs leading-relaxed transition-all shadow-xs break-words',
            isMe
              ? 'bg-[#0078d4] text-white rounded-tr-xs'
              : 'bg-white dark:bg-[#222222] text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-tl-xs'
          )}
        >
          {content}

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="mt-2 space-y-1.5 pt-2 border-t border-white/20 dark:border-neutral-700/60">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                    isMe
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white'
                  )}
                >
                  <div className="p-1.5 rounded bg-[#0078d4]/20 text-[#0078d4] dark:text-blue-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate flex-1 text-left">
                    <div className="font-medium truncate text-xs">{att.name}</div>
                    <div className="text-[10px] opacity-75">{att.size}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reactions List */}
        {reactions && Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message.id, emoji)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] bg-neutral-100 dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:scale-105 transition-transform cursor-pointer"
              >
                <span>{emoji}</span>
                <span className="font-semibold text-[10px]">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover Emoji Reaction Trigger */}
      <div
        className={cn(
          'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded-full px-1.5 py-0.5 shadow-sm gap-0.5 z-10',
          isMe ? 'right-[75%]' : 'left-[75%]'
        )}
      >
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onReact(message.id, emoji)}
            className="w-5 h-5 flex items-center justify-center text-xs hover:scale-125 transition-transform cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

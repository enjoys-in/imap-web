'use client';

import React, { useRef, useEffect } from 'react';
import { Hash, Phone, Video, Info, Star, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatConversation, ChatMessage, ChatAttachment } from './useChatState';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInputComposer } from './ChatInputComposer';

interface ChatMessageAreaProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  onSendMessage: (content: string, attachment?: ChatAttachment) => void;
  onReact: (messageId: string, emoji: string) => void;
  onToggleInfo: () => void;
  isInfoOpen: boolean;
}

export function ChatMessageArea({
  conversation,
  messages,
  onSendMessage,
  onReact,
  onToggleInfo,
  isInfoOpen,
}: ChatMessageAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const isChannel = conversation.type === 'channel';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50/30 dark:bg-[#181818]">
      {/* Conversation Top Header */}
      <div className="h-14 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1c1c1c] flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {isChannel ? (
              <Hash className="w-4 h-4 text-neutral-500" />
            ) : conversation.avatar ? (
              <img src={conversation.avatar} alt={conversation.name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <span className="font-bold text-xs">{conversation.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                {isChannel ? `#${conversation.name}` : conversation.name}
              </h2>
              {!isChannel && conversation.status && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </div>
            <p className="text-[11px] text-neutral-500 truncate max-w-sm">
              {isChannel
                ? conversation.description || `${conversation.membersCount || 1} members`
                : conversation.description || conversation.status || 'Active now'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-neutral-500">
          <button
            type="button"
            title="Search in conversation"
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
          {!isChannel && (
            <>
              <button
                type="button"
                title="Start Voice Call"
                className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Start Video Meeting"
                className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            type="button"
            title="Star Conversation"
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Star className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-neutral-200 dark:border-neutral-800 mx-1" />
          <button
            type="button"
            onClick={onToggleInfo}
            title="Conversation Details"
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              isInfoOpen
                ? 'bg-[#0078d4]/10 text-[#0078d4]'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
            )}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Day separator */}
        <div className="flex items-center justify-center my-4">
          <div className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
            Today
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-xs">
            <p>No messages yet in this conversation.</p>
            <p className="mt-1 text-[11px]">Send a greeting to start chatting!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} onReact={onReact} />
          ))
        )}
      </div>

      {/* Input Composer */}
      <ChatInputComposer
        placeholder={isChannel ? `Message #${conversation.name}...` : `Message ${conversation.name}...`}
        onSend={onSendMessage}
      />
    </div>
  );
}

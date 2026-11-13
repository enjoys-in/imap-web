'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Bold, Italic, Link2, Code, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatAttachment } from './useChatState';

interface ChatInputComposerProps {
  placeholder: string;
  onSend: (content: string, attachment?: ChatAttachment) => void;
}

export function ChatInputComposer({ placeholder, onSend }: ChatInputComposerProps) {
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !attachment) return;
    onSend(content, attachment || undefined);
    setContent('');
    setAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleAttachDummy = () => {
    // Quick demo attachment simulate
    setAttachment({
      name: 'Project-Brief-v2.pdf',
      size: '1.8 MB',
      type: 'pdf',
    });
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const applyFormat = (prefix: string, suffix: string = prefix) => {
    setContent((prev) => `${prev}${prefix}text${suffix}`);
  };

  const POPULAR_EMOJIS = ['👍', '❤️', '🔥', '🚀', '🎉', '😊', '🙌', '💡', '✅', '👀'];

  return (
    <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1c1c1c] relative select-none">
      {/* Emoji Picker Quick Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 p-2 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg flex items-center gap-1.5 z-20">
          {POPULAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Chip Preview */}
      {attachment && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 w-fit text-xs">
          <Paperclip className="w-3.5 h-3.5 text-[#0078d4]" />
          <span className="font-medium text-neutral-800 dark:text-neutral-200">{attachment.name}</span>
          <span className="text-neutral-400 text-[10px]">({attachment.size})</span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        </div>
      )}

      {/* Text Area Container */}
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden focus-within:border-[#0078d4] focus-within:ring-1 focus-within:ring-[#0078d4] transition-all bg-neutral-50/50 dark:bg-[#222222]">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="w-full p-2.5 text-xs bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none resize-none"
        />

        {/* Toolbar Footer */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-100/60 dark:bg-[#1a1a1a] border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center gap-1 text-neutral-500">
            <button
              type="button"
              onClick={() => applyFormat('**')}
              title="Bold"
              className="p-1 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*')}
              title="Italic"
              className="p-1 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('`')}
              title="Code"
              className="p-1 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1" />
            <button
              type="button"
              onClick={handleAttachDummy}
              title="Attach File"
              className="p-1 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded cursor-pointer"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              title="Emoji"
              className="p-1 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded cursor-pointer"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() && !attachment}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              content.trim() || attachment
                ? 'bg-[#0078d4] text-white hover:bg-[#106ebe] shadow-xs'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            )}
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

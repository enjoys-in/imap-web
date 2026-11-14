'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { useComposeStore } from '@/stores';
import { useRecentAttachmentsStore } from '@/stores/useRecentAttachmentsStore';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useSession } from '@/components/providers/SessionProvider';
import { useAttachFiles } from '@/hooks/useAttachFiles';
import { MAX_ATTACHMENT_TOTAL_BYTES } from '@/lib/attachmentLimits';
import { formatFileSize } from '@/lib/utils';
import { ComposeRichToolbar } from './ComposeRichToolbar';

export function ComposeEditor() {
  const body = useComposeStore((s) => s.body);
  const updateFields = useComposeStore((s) => s.updateFields);
  const attachFiles = useAttachFiles();
  const addRecent = useRecentAttachmentsStore((s) => s.addRecent);
  const savedSignature = useGeneralSettingsStore((s) => s.emailSignature);
  const { account } = useSession();

  const [isDragOver, setIsDragOver] = useState(false);
  const [canvasLight, setCanvasLight] = useState(false);
  const [importance, setImportance] = useState<'normal' | 'high' | 'low'>('normal');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      attachFiles(Array.from(e.dataTransfer.files)).forEach((file) => {
        addRecent({ name: file.name, size: file.size, type: file.type });
      });
    }
  };

  const handleFormat = (command: string, value?: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.substring(start, end);

    let replacement = selected;
    switch (command) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        break;
      case 'underline':
        replacement = `<u>${selected || 'underlined text'}</u>`;
        break;
      case 'strikethrough':
        replacement = `~~${selected || 'strikethrough text'}~~`;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'quoted text'}\n`;
        break;
      case 'insertUnorderedList':
        replacement = `\n- ${selected || 'list item'}\n`;
        break;
      case 'insertOrderedList':
        replacement = `\n1. ${selected || 'list item'}\n`;
        break;
      case 'createLink':
        replacement = `[${selected || 'link text'}](https://example.com)`;
        break;
      case 'subscript':
        replacement = `<sub>${selected || '2'}</sub>`;
        break;
      case 'superscript':
        replacement = `<sup>${selected || '2'}</sup>`;
        break;
      default:
        break;
    }

    const nextBody = body.substring(0, start) + replacement + body.substring(end);
    updateFields({ body: nextBody });
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 10);
  };

  const handleInsertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      updateFields({ body: body + emoji });
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    updateFields({ body: body.substring(0, start) + emoji + body.substring(end) });
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  };

  const handleInsertSignature = () => {
    const text = savedSignature.trim() || [account?.displayName, account?.email].filter(Boolean).join('\n');
    if (!text) return;
    updateFields({ body: `${body}\n\n${savedSignature.trim() ? text : `--\n${text}`}` });
  };

  const handleAttachClick = () => {
    updateFields({ isAttaching: true });
    fileInputRef.current?.click();
    setTimeout(() => {
      updateFields({ isAttaching: false });
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFields({ isAttaching: false });
    if (e.target.files) {
      attachFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 flex flex-col min-h-0 relative transition-colors ${
        canvasLight ? 'bg-white text-neutral-900' : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
      }`}
    >
      <ComposeRichToolbar
        onFormat={handleFormat}
        onAttachClick={handleAttachClick}
        onInsertSignature={handleInsertSignature}
        onInsertEmoji={handleInsertEmoji}
        canvasLight={canvasLight}
        onToggleCanvas={() => setCanvasLight((v) => !v)}
        importance={importance}
        onToggleImportance={(lvl) => setImportance((prev) => (prev === lvl ? 'normal' : lvl))}
      />

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />

      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-xs border-2 border-dashed border-[#0078d4] z-20 flex flex-col items-center justify-center pointer-events-none">
          <UploadCloud className="w-10 h-10 text-[#0078d4] animate-bounce" />
          <p className="text-sm font-semibold text-[#0078d4] mt-2">Drop files here to attach</p>
          <p className="text-xs text-[#0078d4]/80 mt-0.5">
            Up to {formatFileSize(MAX_ATTACHMENT_TOTAL_BYTES)} total per message
          </p>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => updateFields({ body: e.target.value })}
        placeholder="Type your message here, or drag & drop files to attach..."
        className="flex-1 w-full p-3 resize-none focus:outline-none text-xs md:text-sm bg-transparent placeholder:text-neutral-400 font-sans leading-relaxed"
      />
    </div>
  );
}

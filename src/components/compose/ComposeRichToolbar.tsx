'use client';

import React, { useState } from 'react';
import {
  Undo2,
  Clipboard,
  Paintbrush,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Baseline,
  Eraser,
  Quote,
  List,
  ListOrdered,
  Outdent,
  Indent,
  AlignLeft,
  MoveVertical,
  SpellCheck,
  Subscript,
  Superscript,
  Paperclip,
  Link2,
  FileSignature,
  Mic,
  Feather,
  Sun,
  Lock,
  Printer,
  MoreHorizontal,
  ChevronDown,
  ArrowDown,
} from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';
import { ComposeAttachMenu } from './ComposeAttachMenu';
import { ComposeSignatureMenu } from './ComposeSignatureMenu';

interface ComposeRichToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onAttachClick?: () => void;
  onInsertSignature?: () => void;
  canvasLight?: boolean;
  onToggleCanvas?: () => void;
  importance?: 'normal' | 'high' | 'low';
  onToggleImportance?: (level: 'high' | 'low') => void;
}

export function ComposeRichToolbar({
  onFormat,
  onAttachClick,
  onInsertSignature,
  canvasLight = false,
  onToggleCanvas,
  importance = 'normal',
  onToggleImportance,
}: ComposeRichToolbarProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [fontFamily, setFontFamily] = useState('Segoe UI');
  const [fontSize, setFontSize] = useState('11');
  const [isDictating, setIsDictating] = useState(false);

  const btnClass = 'p-1 hover:bg-neutral-200 dark:hover:bg-[#383838] rounded text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-0.5 shrink-0 cursor-pointer';

  const handleDictate = () => {
    setIsDictating((v) => !v);
    addToast({
      title: !isDictating ? 'Dictation Active' : 'Dictation Stopped',
      description: !isDictating ? 'Speak into your microphone to dictate text...' : 'Voice input paused.',
      type: 'info',
    });
  };

  return (
    <div className="h-9 border-b border-neutral-200 dark:border-neutral-800 px-2 flex items-center gap-0.5 select-none bg-neutral-100/90 dark:bg-[#202020] text-xs overflow-x-auto scrollbar-none shrink-0 transition-colors">
      {/* Undo, Paste & Format Painter */}
      <button type="button" onClick={() => onFormat('undo')} className={btnClass} title="Undo (Ctrl+Z)"><Undo2 className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5 opacity-60" /></button>
      <button type="button" onClick={() => onFormat('paste')} className={btnClass} title="Paste (Ctrl+V)"><Clipboard className="w-3.5 h-3.5 text-amber-500" /><ChevronDown className="w-2.5 h-2.5 opacity-60" /></button>
      <button type="button" onClick={() => onFormat('formatPainter')} className={btnClass} title="Format Painter"><Paintbrush className="w-3.5 h-3.5 text-amber-500" /></button>

      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0" />

      {/* Font Family & Size Selectors */}
      <select value={fontFamily} onChange={(e) => { setFontFamily(e.target.value); onFormat('fontName', e.target.value); }} className="h-6 px-1.5 text-[11px] rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 font-medium shrink-0 cursor-pointer">
        <option value="Segoe UI">Segoe UI</option><option value="Calibri">Calibri</option><option value="Aptos">Aptos (Body)</option><option value="Arial">Arial</option><option value="Times New Roman">Times New Roman</option><option value="Courier New">Courier New</option>
      </select>
      <select value={fontSize} onChange={(e) => { setFontSize(e.target.value); onFormat('fontSize', e.target.value); }} className="h-6 px-1 text-[11px] rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 font-medium shrink-0 cursor-pointer">
        <option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="14">14</option><option value="16">16</option><option value="18">18</option><option value="24">24</option>
      </select>

      {/* Bold, Italic, Underline, Strikethrough */}
      <button type="button" onClick={() => onFormat('bold')} className={btnClass} title="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5 font-bold" /></button>
      <button type="button" onClick={() => onFormat('italic')} className={btnClass} title="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onFormat('underline')} className={btnClass} title="Underline (Ctrl+U)"><Underline className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onFormat('strikethrough')} className={btnClass} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>

      {/* Highlight & Font Color */}
      <button type="button" onClick={() => onFormat('hiliteColor', '#fef08a')} className={btnClass} title="Highlight color">
        <div className="relative flex flex-col items-center"><Highlighter className="w-3.5 h-3.5" /><span className="w-3 h-0.5 bg-yellow-400 rounded-full" /></div>
        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
      </button>
      <button type="button" onClick={() => onFormat('foreColor', '#ef4444')} className={btnClass} title="Font color">
        <div className="relative flex flex-col items-center"><Baseline className="w-3.5 h-3.5" /><span className="w-3 h-0.5 bg-red-500 rounded-full" /></div>
        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
      </button>
      <button type="button" onClick={() => onFormat('removeFormat')} className={btnClass} title="Clear formatting"><Eraser className="w-3.5 h-3.5" /></button>

      {/* Lists, Quote, Indent */}
      <button type="button" onClick={() => onFormat('quote')} className={btnClass} title="Quote"><Quote className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onFormat('insertUnorderedList')} className={btnClass} title="Bulleted list"><List className="w-3.5 h-3.5 text-blue-400" /></button>
      <button type="button" onClick={() => onFormat('insertOrderedList')} className={btnClass} title="Numbered list"><ListOrdered className="w-3.5 h-3.5 text-blue-400" /></button>
      <button type="button" onClick={() => onFormat('outdent')} className={btnClass} title="Decrease indent"><Outdent className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onFormat('indent')} className={btnClass} title="Increase indent"><Indent className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onFormat('align')} className={btnClass} title="Alignment"><AlignLeft className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5 opacity-60" /></button>
      <button type="button" onClick={() => onFormat('lineSpacing')} className={btnClass} title="Line spacing"><MoveVertical className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onFormat('spellCheck')} className={btnClass} title="Spell check"><SpellCheck className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => onFormat('subscript')} className={btnClass} title="Subscript"><Subscript className="w-3.5 h-3.5 text-blue-400" /></button>
      <button type="button" onClick={() => onFormat('superscript')} className={btnClass} title="Superscript"><Superscript className="w-3.5 h-3.5 text-blue-400" /></button>

      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0" />

      {/* Attach, Link, Signature & Dictate */}
      <ComposeAttachMenu variant="icon" />
      <button type="button" onClick={() => onFormat('createLink')} className={btnClass} title="Insert link (Ctrl+K)"><Link2 className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5 opacity-60" /></button>
      <ComposeSignatureMenu />
      <button type="button" onClick={handleDictate} className={`${btnClass} ${isDictating ? 'bg-red-100 dark:bg-red-950/50 text-red-600' : 'text-[#0078d4]'}`} title="Dictate audio"><Mic className="w-3.5 h-3.5" /></button>

      <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 shrink-0" />

      {/* Editor, Canvas, Security & Importance */}
      <button type="button" onClick={() => addToast({ title: 'Microsoft Editor', description: 'Grammar and clarity assistant active.', type: 'info' })} className={`${btnClass} gap-1`} title="Editor assistance">
        <Feather className="w-3.5 h-3.5 text-[#0078d4]" />
        <span className="text-[11px] font-medium hidden md:inline">Editor</span>
        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
      </button>

      <button type="button" onClick={onToggleCanvas} className={`${btnClass} ${canvasLight ? 'text-amber-500' : ''}`} title="Toggle light/dark canvas background"><Sun className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => addToast({ title: 'Message Encryption', description: 'Sensitivity set to Confidential.', type: 'info' })} className={btnClass} title="Encrypt message"><Lock className="w-3.5 h-3.5" /></button>

      <button type="button" onClick={() => onToggleImportance?.('high')} className={`${btnClass} ${importance === 'high' ? 'bg-red-100 dark:bg-red-950/60 text-red-600 font-bold' : ''}`} title="High importance">
        <span className="font-extrabold text-red-600 text-xs leading-none">!</span>
      </button>

      <button type="button" onClick={() => onToggleImportance?.('low')} className={`${btnClass} ${importance === 'low' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600' : ''}`} title="Low importance">
        <ArrowDown className="w-3.5 h-3.5 text-[#0078d4]" />
      </button>

      <button type="button" onClick={() => window.print()} className={btnClass} title="Print draft"><Printer className="w-3.5 h-3.5" /></button>
      <button type="button" onClick={() => addToast({ title: 'More Options', description: 'Delivery options, voting buttons, and tracking.', type: 'info' })} className={btnClass} title="More options"><MoreHorizontal className="w-3.5 h-3.5" /></button>
    </div>
  );
}

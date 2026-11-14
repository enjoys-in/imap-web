'use client';

import React from 'react';
import { PenTool, FolderPlus, Paperclip, SpellCheck } from 'lucide-react';
import { AccountCompositionSettings } from '@/types/perAccountSettings';
import { useToastStore } from '@/stores/useToastStore';

interface AccountCompositionTabProps {
  settings: AccountCompositionSettings;
  onChange: (updates: Partial<AccountCompositionSettings>) => void;
}

export function AccountCompositionTab({ settings, onChange }: AccountCompositionTabProps) {
  const addToast = useToastStore((s) => s.addToast);
  const inputClass = 'h-7 px-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525]';

  return (
    <div className="space-y-5 text-xs text-neutral-800 dark:text-neutral-200">
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[#0078d4]" />
          <span>Composition, Addressing & Copies</span>
        </h4>
        <p className="text-neutral-500 mt-0.5">Editor behaviors, auto-save, spelling, sending formats, and automated folder copies.</p>
      </div>

      {/* General Composition & Autosave */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">General Editing</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.addExtensionToFileName} onChange={(e) => onChange({ addExtensionToFileName: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Add extension to file name</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.confirmKeyboardSend} onChange={(e) => onChange({ confirmKeyboardSend: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Confirm when using keyboard shortcut to send</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.addLinkPreviews} onChange={(e) => onChange({ addLinkPreviews: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Add link previews when pasting URLs</span>
          </label>
          <div className="flex items-center gap-2">
            <span>Auto Save every</span>
            <input type="number" min={1} max={60} value={settings.autoSaveEveryMinutes} onChange={(e) => onChange({ autoSaveEveryMinutes: Number(e.target.value) })} className={`w-14 ${inputClass}`} />
            <span>minutes</span>
          </div>
        </div>
      </div>

      {/* Spelling & HTML Style */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Spelling & HTML Format</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.checkSpellingBeforeSending} onChange={(e) => onChange({ checkSpellingBeforeSending: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Check spelling before sending</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.enableSpellcheckAsYouType} onChange={(e) => onChange({ enableSpellcheckAsYouType: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Enable spellcheck as you type</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.useReaderDefaultColors} onChange={(e) => onChange({ useReaderDefaultColors: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Use reader’s default colors</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.useParagraphFormat} onChange={(e) => onChange({ useParagraphFormat: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Use Paragraph format instead of Body Text</span>
          </label>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80">
          <span className="text-[11px] font-medium text-neutral-500 block mb-1">Sending Format</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <label className="flex items-start gap-1.5 cursor-pointer">
              <input type="radio" name="sendingFormat" checked={settings.sendingFormat === 'auto'} onChange={() => onChange({ sendingFormat: 'auto' })} className="accent-[#0078d4] mt-0.5" />
              <div><strong className="block">Automatic</strong><span className="text-neutral-500">Send HTML with Plain Text fallback.</span></div>
            </label>
            <label className="flex items-start gap-1.5 cursor-pointer">
              <input type="radio" name="sendingFormat" checked={settings.sendingFormat === 'both'} onChange={() => onChange({ sendingFormat: 'both' })} className="accent-[#0078d4] mt-0.5" />
              <div><strong className="block">Both HTML and Plain Text</strong><span className="text-neutral-500">Recipient application determines version.</span></div>
            </label>
            <label className="flex items-start gap-1.5 cursor-pointer">
              <input type="radio" name="sendingFormat" checked={settings.sendingFormat === 'html'} onChange={() => onChange({ sendingFormat: 'html' })} className="accent-[#0078d4] mt-0.5" />
              <div><strong className="block">Only HTML</strong><span className="text-neutral-500">Strict HTML without fallback.</span></div>
            </label>
            <label className="flex items-start gap-1.5 cursor-pointer">
              <input type="radio" name="sendingFormat" checked={settings.sendingFormat === 'plaintext'} onChange={() => onChange({ sendingFormat: 'plaintext' })} className="accent-[#0078d4] mt-0.5" />
              <div><strong className="block">Only Plain Text</strong><span className="text-neutral-500">Styles disabled for maximum compatibility.</span></div>
            </label>
          </div>
        </div>
      </div>

      {/* Copies & Sent Folders */}
      <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2.5">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">Copies & Folders</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings.placeCopyInSent} onChange={(e) => onChange({ placeCopyInSent: e.target.checked })} className="accent-[#0078d4] rounded" />
          <span>Place a copy in &quot;Sent&quot; folder on {settings.sentFolderAccount}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings.placeRepliesInCurrentFolder} onChange={(e) => onChange({ placeRepliesInCurrentFolder: e.target.checked })} className="accent-[#0078d4] rounded" />
          <span>Place replies in the folder of the message being replied to</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] text-neutral-500 block mb-0.5">Cc these email addresses:</label>
            <input type="text" value={settings.defaultCc} onChange={(e) => onChange({ defaultCc: e.target.value })} placeholder="cc@domain.com" className={`w-full ${inputClass}`} />
          </div>
          <div>
            <label className="text-[11px] text-neutral-500 block mb-0.5">Bcc these email addresses:</label>
            <input type="text" value={settings.defaultBcc} onChange={(e) => onChange({ defaultBcc: e.target.value })} placeholder="bcc@domain.com" className={`w-full ${inputClass}`} />
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={settings.autoQuoteOnReply} onChange={(e) => onChange({ autoQuoteOnReply: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Automatically quote original message on reply</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={settings.includeSignatureForReplies} onChange={(e) => onChange({ includeSignatureForReplies: e.target.checked })} className="accent-[#0078d4] rounded" />
            <span>Include signature for replies</span>
          </label>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FileSignature, ChevronDown, Check, Settings, Edit3, X } from 'lucide-react';
import { useComposeStore } from '@/stores';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { useSession } from '@/components/providers/SessionProvider';
import { cn } from '@/lib/utils';

interface SignatureOption {
  id: string;
  name: string;
  body: string;
}

export function ComposeSignatureMenu({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customSig, setCustomSig] = useState('');

  const body = useComposeStore((s) => s.body);
  const updateFields = useComposeStore((s) => s.updateFields);
  const settingsSig = useGeneralSettingsStore((s) => s.emailSignature);
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);
  const { account } = useSession();

  const signatureOptions = useMemo<SignatureOption[]>(() => {
    const options: SignatureOption[] = [];
    if (settingsSig.trim()) {
      options.push({ id: 'saved', name: 'Saved signature', body: settingsSig });
    }
    const identity = [account?.displayName, account?.email].filter(Boolean).join('\n');
    if (identity) {
      options.push({ id: 'account', name: 'Account details', body: `--\n${identity}` });
    }
    return options;
  }, [settingsSig, account?.displayName, account?.email]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectSignature = (sigText: string, sigName: string) => {
    const formatted = `\n\n${sigText}`;
    updateFields({ body: body + formatted });
    setIsOpen(false);
    addToast({ title: 'Signature Inserted', description: `Added ${sigName} signature.`, type: 'info' });
  };

  const handleOpenEdit = () => {
    setCustomSig(settingsSig || '');
    setIsEditing(true);
    setIsOpen(false);
  };

  const handleSaveCustomSig = () => {
    updateSettings({ emailSignature: customSig });
    setIsEditing(false);
    updateFields({ body: body + `\n\n${customSig}` });
    addToast({ title: 'Signature Updated', description: 'Saved as your default signature.', type: 'success' });
  };

  return (
    <div ref={containerRef} className="relative inline-block select-none text-xs">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'p-1 hover:bg-neutral-200 dark:hover:bg-[#383838] rounded text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-0.5 shrink-0 cursor-pointer',
          className
        )}
        title="Insert or set signature"
      >
        <FileSignature className="w-3.5 h-3.5 text-[#0078d4]" />
        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700/80 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Insert signature
          </div>

          <div className="py-0.5">
            {signatureOptions.length === 0 && (
              <div className="px-3 py-1.5 text-[11px] text-neutral-400">No signature saved yet</div>
            )}
            {signatureOptions.map((sig) => (
              <button
                key={sig.id}
                type="button"
                onClick={() => handleSelectSignature(sig.body, sig.name)}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors"
              >
                <span className="font-medium">{sig.name}</span>
                <span className="text-[10px] text-neutral-400 truncate max-w-[90px]">{sig.body.split('\n')[0]}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800 my-1 pt-1 space-y-0.5">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-[#0078d4] font-medium cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Set signature...</span>
            </button>
            <Link
              href="/settings/accounts/signatures"
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Signature settings</span>
            </Link>
          </div>
        </div>
      )}

      {/* In-Editor Signature Config Dialog */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl w-full max-w-md p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-[#0078d4]" />
                <span>Set Your Signature</span>
              </h4>
              <button onClick={() => setIsEditing(false)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={5}
              value={customSig}
              onChange={(e) => setCustomSig(e.target.value)}
              placeholder="Type your signature here..."
              className="w-full p-2.5 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#181818] text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#0078d4]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleSaveCustomSig} className="px-3.5 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold rounded flex items-center gap-1 cursor-pointer">
                <Check className="w-3.5 h-3.5" />
                <span>Save & Insert</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

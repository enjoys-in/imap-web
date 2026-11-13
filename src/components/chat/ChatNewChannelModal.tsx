'use client';

import React, { useState } from 'react';
import { X, Hash, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatNewChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export function ChatNewChannelModal({ isOpen, onClose, onCreate }: ChatNewChannelModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
    setName('');
    setDescription('');
    setIsPrivate(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#0078d4]/10 text-[#0078d4]">
              <Hash className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Create a Channel</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">#</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. imap-release-qa"
                className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1a1a1a] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              rows={2}
              className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1a1a1a] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d4] resize-none"
            />
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Channel Privacy
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={cn(
                  'flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                  !isPrivate
                    ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300'
                )}
              >
                <Globe className="w-4 h-4 text-[#0078d4] shrink-0" />
                <div>
                  <p className="font-semibold text-xs">Public</p>
                  <p className="text-[10px] text-neutral-400">Anyone on team</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={cn(
                  'flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                  isPrivate
                    ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10 text-neutral-900 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300'
                )}
              >
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <p className="font-semibold text-xs">Private</p>
                  <p className="text-[10px] text-neutral-400">Invite-only</p>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                name.trim()
                  ? 'bg-[#0078d4] text-white hover:bg-[#106ebe]'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              )}
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

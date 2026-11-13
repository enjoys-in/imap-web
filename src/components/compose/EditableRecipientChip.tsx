'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Edit2 } from 'lucide-react';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { ProfileCardModal, ProfileContactData } from '@/components/profile/ProfileCardModal';
import { useToastStore } from '@/stores/useToastStore';

export interface RecipientItem {
  id: string;
  name: string;
  email: string;
}

interface EditableRecipientChipProps {
  recipient: RecipientItem;
  onUpdate: (updated: { name: string; email: string }) => void;
  onRemove: () => void;
}

export function EditableRecipientChip({ recipient, onUpdate, onRemove }: EditableRecipientChipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    recipient.name && recipient.name !== recipient.email ? `${recipient.name} <${recipient.email}>` : recipient.email
  );
  const [copied, setCopied] = useState(false);
  const [isFullProfileOpen, setIsFullProfileOpen] = useState(false);

  const chipRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const domain = recipient.email.split('@')[1] || '';
  const companyName = domain ? domain.split('.')[0].toUpperCase() : 'ORGANIZATION';

  const handleMouseEnter = () => {
    if (!isEditing) hoverTimer.current = setTimeout(() => setIsHovered(true), 280);
  };
  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(false);
  };

  const handleStartEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsHovered(false);
    setIsEditing(true);
    setEditValue(recipient.name && recipient.name !== recipient.email ? `${recipient.name} <${recipient.email}>` : recipient.email);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      onRemove();
      return;
    }
    const match = trimmed.match(/^(.*?)\s*<([^>]+)>$/);
    if (match) {
      onUpdate({ name: match[1].trim() || match[2].trim(), email: match[2].trim() });
    } else {
      const email = trimmed;
      const name = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
      onUpdate({ name, email });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email);
    }
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(recipient.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    addToast({ title: 'Copied', description: recipient.email, type: 'info' });
  };

  const profileData: ProfileContactData = {
    name: recipient.name || recipient.email,
    email: recipient.email,
    company: `${companyName} Corp`,
    phone: '+1 (555) 019-2834',
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitEdit}
          className="h-6 px-2.5 rounded-full border border-[#0078d4] bg-white dark:bg-[#1f1f1f] text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none shadow-sm min-w-[200px]"
        />
      </div>
    );
  }

  return (
    <div ref={chipRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative inline-flex items-center">
      <div
        onClick={() => handleStartEditing()}
        className="flex items-center gap-1.5 pl-1 pr-1.5 py-0.5 rounded-full bg-neutral-200/80 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 text-xs shadow-2xs transition-colors hover:border-[#0078d4] hover:bg-neutral-300/60 dark:hover:bg-neutral-700/80 cursor-pointer select-none group"
        title="Click to edit recipient address (hover for profile)"
      >
        <BimiAvatar name={recipient.name} email={recipient.email} size="sm" className="w-4 h-4 text-[9px] font-bold" />
        <span className="font-medium max-w-[150px] truncate group-hover:underline">{recipient.name}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="hover:text-red-600 dark:hover:text-red-400 text-neutral-400 p-0.5 rounded-full cursor-pointer transition-colors"
          title="Remove recipient"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {isHovered && !isEditing && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl p-3 z-50 text-neutral-800 dark:text-neutral-200 animate-in fade-in duration-100">
          <div className="flex items-start gap-2.5 pb-2.5 border-b border-neutral-200 dark:border-neutral-800">
            <BimiAvatar name={recipient.name} email={recipient.email} size="md" className="w-9 h-9 text-xs font-bold" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">{recipient.name}</div>
              <div className="text-[11px] text-neutral-500 truncate">{recipient.email}</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Verified Contact · {companyName}</div>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between gap-1 text-[11px]">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex-1 py-1 px-2 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleStartEditing(e)}
              className="flex-1 py-1 px-2 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsHovered(false); setIsFullProfileOpen(true); }}
              className="py-1 px-2 rounded bg-[#0078d4]/10 hover:bg-[#0078d4]/20 text-[#0078d4] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="View full profile"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {isFullProfileOpen && (
        <ProfileCardModal contact={profileData} isOpen={isFullProfileOpen} onClose={() => setIsFullProfileOpen(false)} />
      )}
    </div>
  );
}

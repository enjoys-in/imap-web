'use client';

import React, { useState, useRef, useMemo } from 'react';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { EditableRecipientChip } from './EditableRecipientChip';

export interface Recipient {
  id: string;
  name: string;
  email: string;
}

const SUGGESTIONS = [
  { name: 'Jeelan Basha Shaik', email: 'jeelan.shaik@recruitment.com' },
  { name: 'Gaurav Raj', email: 'gaurav.raj@avelix.com' },
  { name: 'Phil Kell', email: 'phil@hackajob.com' },
  { name: 'Whitekraaft Recruitment', email: 'recruitment@whitekraaft.com' },
];

export function parseRecipientText(raw: string): Recipient[] {
  if (!raw || !raw.trim()) return [];
  const parts = raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  return parts.map((part, index) => {
    const match = part.match(/^(.*?)\s*<([^>]+)>$/);
    if (match) {
      return {
        id: `rec-${index}-${match[2]}`,
        name: match[1].replace(/['"]/g, '').trim() || match[2].trim(),
        email: match[2].trim(),
      };
    }
    const emailMatch = part.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    return {
      id: `rec-${index}-${part}`,
      name: part.includes('@') ? part.split('@')[0].trim() : part,
      email: emailMatch ? emailMatch[0] : part,
    };
  });
}

export function serializeRecipients(recipients: Recipient[]): string {
  return recipients.map((r) => (r.name && r.name !== r.email ? `${r.name} <${r.email}>` : r.email)).join(', ');
}

interface RecipientChipInputProps {
  label: string;
  value: string;
  onChange: (serialized: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function RecipientChipInput({
  label,
  value,
  onChange,
  placeholder = 'Add recipients...',
  autoFocus = false,
}: RecipientChipInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const recipients = useMemo(() => parseRecipientText(value), [value]);

  const addRecipient = (name: string, email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    if (recipients.some((r) => r.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      setInputValue('');
      return;
    }
    const updated = [...recipients, { id: `rec-${Date.now()}`, name: name.trim() || trimmedEmail, email: trimmedEmail }];
    onChange(serializeRecipients(updated));
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeRecipient = (index: number) => {
    const updated = recipients.filter((_, i) => i !== index);
    onChange(serializeRecipients(updated));
  };

  const handleUpdateRecipient = (index: number, updatedItem: { name: string; email: string }) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], ...updatedItem };
    onChange(serializeRecipients(updated));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ';') && inputValue.trim()) {
      e.preventDefault();
      const match = inputValue.match(/^(.*?)\s*<([^>]+)>$/);
      if (match) {
        addRecipient(match[1], match[2]);
      } else {
        addRecipient(inputValue.split('@')[0], inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      removeRecipient(recipients.length - 1);
    }
  };

  const filteredSuggestions = SUGGESTIONS.filter((s) => {
    const q = inputValue.toLowerCase().trim();
    if (!q) return false;
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  return (
    <div className="relative flex flex-wrap items-center gap-1.5 py-1 text-xs select-none">
      <span className="w-10 text-neutral-500 font-medium shrink-0">{label}</span>

      {/* Recipient Chips with Hover Profile & Click-to-Edit */}
      {recipients.map((rec, idx) => (
        <EditableRecipientChip
          key={rec.id}
          recipient={rec}
          onUpdate={(updated) => handleUpdateRecipient(idx, updated)}
          onRemove={() => removeRecipient(idx)}
        />
      ))}

      {/* Input Field for Typing Next Recipient */}
      <div className="flex-1 min-w-[130px] relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          autoFocus={autoFocus}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={recipients.length === 0 ? placeholder : ''}
          className="w-full bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-xs"
        />

        {/* Contact Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl py-1 z-50">
            {filteredSuggestions.map((s) => (
              <button
                key={s.email}
                type="button"
                onMouseDown={() => addRecipient(s.name, s.email)}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <BimiAvatar name={s.name} email={s.email} size="sm" className="w-5 h-5 text-[10px]" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium text-neutral-800 dark:text-neutral-200">{s.name}</div>
                  <div className="truncate text-[10px] text-neutral-400">{s.email}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

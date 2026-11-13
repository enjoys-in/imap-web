import React from 'react';
import { Mail } from 'lucide-react';
import { AccountProviderType } from '@/types';

interface AccountProviderIconProps {
  type?: AccountProviderType;
  className?: string;
}

export function AccountProviderIcon({ type = 'IMAP', className = '' }: AccountProviderIconProps) {
  if (type === 'Outlook.com') {
    return (
      <div
        className={`w-8 h-8 rounded bg-[#0078d4] flex items-center justify-center text-white shadow-xs shrink-0 ${className}`}
        title="Outlook.com"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 7V3.5L18.5 7H15zM6 20V4h7v5a1 1 0 0 0 1 1h5v10H6z" />
          <path d="M8 12h8v2H8zm0 3h8v2H8z" />
        </svg>
      </div>
    );
  }

  if (type === 'Microsoft 365') {
    return (
      <div
        className={`w-8 h-8 rounded bg-gradient-to-tr from-[#0078d4] via-[#6b21a8] to-[#d83b01] flex items-center justify-center text-white shadow-xs shrink-0 ${className}`}
        title="Microsoft 365"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13zM12 7l-5 3v4l5 3 5-3v-4l-5-3z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`w-8 h-8 rounded bg-neutral-750 border border-neutral-700 flex items-center justify-center text-neutral-400 shrink-0 ${className}`}
      title="IMAP Account"
    >
      <Mail className="w-4 h-4 text-neutral-300" />
    </div>
  );
}

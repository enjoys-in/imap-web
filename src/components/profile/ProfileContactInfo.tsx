'use client';

import React from 'react';
import { Mail, Phone, ExternalLink, FileText, Globe } from 'lucide-react';

interface ProfileContactInfoProps {
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export function ProfileContactInfo({ name, email, phone = '+91 98765 43210', company = 'Avelix Tech' }: ProfileContactInfoProps) {
  return (
    <div className="space-y-6 text-xs text-neutral-800 dark:text-neutral-200">
      {/* Contact information section */}
      <div className="space-y-3 pb-5 border-b border-neutral-200 dark:border-neutral-800">
        <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Contact information</h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] text-neutral-500 block">Email address</span>
              <a href={`mailto:${email}`} className="text-[#0078d4] hover:underline font-medium">
                {email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] text-neutral-500 block">Work phone</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{phone}</span>
            </div>
          </div>
        </div>

        <button type="button" className="text-xs text-[#0078d4] hover:underline font-semibold block cursor-pointer">
          Show more contact information
        </button>
      </div>

      {/* LinkedIn section */}
      <div className="space-y-3 pb-5 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0a66c2] text-white flex items-center justify-center font-bold text-[10px]">
            in
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">LinkedIn</h4>
        </div>

        <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#202020] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-neutral-200">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-neutral-800 dark:text-neutral-200 text-xs">Several possible matches for {name}</p>
            <span className="text-[11px] text-neutral-500">{company} &bull; Connect on LinkedIn</span>
          </div>
        </div>

        <button type="button" className="text-xs text-[#0078d4] hover:underline font-semibold block cursor-pointer">
          Show profile matches
        </button>
      </div>

      {/* Files section */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Files</h4>
          <p className="text-xs text-neutral-500">Recent files and email attachments from {name}</p>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#202020]">
          <FileText className="w-6 h-6 text-[#d83b01] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">Architecture_Proposal_Sprint24.pdf</div>
            <span className="text-[11px] text-neutral-500">2.4 MB &bull; Modified 3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

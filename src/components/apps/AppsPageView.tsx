'use client';

import React from 'react';
import Link from 'next/link';
import {
  Mail,
  Calendar,
  Users,
  CheckSquare,
  FileText,
  Settings,
  HardDrive,
  MessageSquare,
  Bell,
  ExternalLink,
} from 'lucide-react';

interface AppLaunchItem {
  id: string;
  name: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const APPS: AppLaunchItem[] = [
  { id: 'mail', name: 'AirSend Mail', desc: 'Modern web mail client with IMAP/SMTP synchronization', href: '/mail', icon: Mail, color: 'bg-blue-600 text-white' },
  { id: 'calendar', name: 'Calendar Studio', desc: 'Schedule meetings, pastel color codes, week/day/month views', href: '/calendar', icon: Calendar, color: 'bg-teal-600 text-white' },
  { id: 'chat', name: 'Team Chat', desc: 'Real-time team messaging channels, 1:1 direct messages, and reactions', href: '/chat', icon: MessageSquare, color: 'bg-violet-600 text-white' },
  { id: 'files', name: 'Cloud Storage & Files', desc: 'Unified explorer for email attachments, folders, and documents', href: '/files', icon: HardDrive, color: 'bg-blue-500 text-white' },
  { id: 'activity', name: 'Activity Feed', desc: 'Live timeline of mentions, invites, file uploads, and mail events', href: '/activity', icon: Bell, color: 'bg-rose-500 text-white' },
  { id: 'people', name: 'People & Contacts', desc: 'Address book, contact cards, and team directories', href: '/people', icon: Users, color: 'bg-indigo-600 text-white' },
  { id: 'todo', name: 'To Do', desc: 'Task lists, daily priorities, and deadline management', href: '/todo', icon: CheckSquare, color: 'bg-sky-600 text-white' },
  { id: 'notes', name: 'Sticky Notes', desc: 'Quick capture notes with color tags and instant search', href: '/notes', icon: FileText, color: 'bg-amber-500 text-white' },
  { id: 'settings', name: 'Preferences', desc: 'Per-account incoming, appearance, junk, sync, and server config', href: '/settings/accounts', icon: Settings, color: 'bg-neutral-600 text-white' },
];

export function AppsPageView() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 bg-neutral-50/50 dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-100 select-none transition-colors">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Productivity Apps</h1>
          <p className="text-xs text-neutral-500 mt-1">Explore all tools, apps, and sidecars integrated into your AirSend workspace.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {APPS.map(({ id, name, desc, href, icon: Icon, color }) => (
            <Link key={id} href={href} className="block h-full">
              <div className="h-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-[#0078d4] dark:hover:border-[#0078d4] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-xs ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0078d4] transition-colors" />
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-1 group-hover:text-[#0078d4] transition-colors">{name}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

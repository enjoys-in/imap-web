'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Calendar, Users, CheckSquare, FileText, Settings, Cloud, FileCode, MessageSquare, ExternalLink } from 'lucide-react';
import { useRightAppsStore } from '@/stores/useRightAppsStore';
import { useToastStore } from '@/stores/useToastStore';

interface AppLaunchItem {
  id: string;
  name: string;
  desc: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action?: () => void;
}

export function AppsPageView() {
  const toggleApp = useRightAppsStore((s) => s.toggleApp);
  const addToast = useToastStore((s) => s.addToast);

  const APPS: AppLaunchItem[] = [
    { id: 'mail', name: 'AirSend Mail', desc: 'Modern web mail client with IMAP/SMTP synchronization', href: '/mail', icon: Mail, color: 'bg-blue-600 text-white' },
    { id: 'calendar', name: 'Calendar', desc: 'Schedule meetings, view daily agenda and manage appointments', href: '/calendar', icon: Calendar, color: 'bg-teal-600 text-white' },
    { id: 'people', name: 'People', desc: 'Address book, contact cards, and team directories', href: '/people', icon: Users, color: 'bg-indigo-600 text-white' },
    { id: 'todo', name: 'To Do', desc: 'Task lists, daily priorities, and deadline management', href: '/todo', icon: CheckSquare, color: 'bg-sky-600 text-white' },
    { id: 'notes', name: 'Sticky Notes', desc: 'Quick capture notes with color tags and instant search', icon: FileText, color: 'bg-amber-500 text-white', action: () => toggleApp('notes') },
    { id: 'settings', name: 'Preferences', desc: 'Per-account incoming, appearance, junk, sync, and server config', href: '/settings/accounts', icon: Settings, color: 'bg-neutral-600 text-white' },
    { id: 'onedrive', name: 'Cloud Storage', desc: 'Connected Filelink storage and attachment archives', icon: Cloud, color: 'bg-blue-500 text-white', action: () => addToast({ title: 'Cloud Storage', description: 'Filelink cloud storage connected.', type: 'info' }) },
    { id: 'teams', name: 'Chat & Teams', desc: 'Instant collaboration and direct messaging channels', icon: MessageSquare, color: 'bg-violet-600 text-white', action: () => addToast({ title: 'Chat & Collaboration', description: 'Teams integration active.', type: 'info' }) },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 bg-neutral-50/50 dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-100 select-none transition-colors">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Productivity Apps</h1>
          <p className="text-xs text-neutral-500 mt-1">Explore all tools, apps, and sidecars integrated into your AirSend workspace.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {APPS.map(({ id, name, desc, href, icon: Icon, color, action }) => {
            const Content = (
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
            );

            if (href) {
              return (
                <Link key={id} href={href} className="block h-full">
                  {Content}
                </Link>
              );
            }

            return (
              <div key={id} onClick={action} className="block h-full">
                {Content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

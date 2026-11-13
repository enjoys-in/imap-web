'use client';

import React from 'react';
import {
  Home,
  Calendar,
  CheckSquare,
  Users,
  FileText,
  Workflow,
  BarChart2,
  Settings,
  Megaphone,
  Plus,
  Search,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectItem {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface CalendarSidebarProps {
  open: boolean;
  activeEssential: string;
  onSelectEssential: (id: string) => void;
  selectedProject: string;
  onSelectProject: (name: string) => void;
  projects: ProjectItem[];
  onAddProject: () => void;
  onOpenSettings: () => void;
  onOpenReleaseNotes: () => void;
}

const ESSENTIALS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'automations', label: 'Automations', icon: Workflow },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
];

export function CalendarSidebar({
  open,
  activeEssential,
  onSelectEssential,
  selectedProject,
  onSelectProject,
  projects,
  onAddProject,
  onOpenSettings,
  onOpenReleaseNotes,
}: CalendarSidebarProps) {
  if (!open) return null;

  return (
    <aside className="w-56 border-r border-neutral-200 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#141414] flex flex-col justify-between shrink-0 select-none py-3 overflow-y-auto">
      <div className="px-3 space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-8 pl-8 pr-7 text-xs bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-lg text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute right-2 top-2 text-[10px] text-neutral-400 flex items-center">
            <Command className="w-2.5 h-2.5 mr-0.5" />F
          </span>
        </div>

        {/* Essentials Section */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-2 uppercase tracking-wider block mb-1">
            Essentials
          </span>
          <nav className="space-y-0.5">
            {ESSENTIALS.map((item) => {
              const Icon = item.icon;
              const isActive = activeEssential === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectEssential(item.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400')} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Projects
            </span>
            <button
              onClick={onAddProject}
              title="Add new project"
              className="w-4 h-4 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <nav className="space-y-0.5">
            {projects.map((proj) => {
              const isSelected = selectedProject === proj.name;
              return (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(proj.name)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2.5 h-8 rounded-lg text-xs font-medium transition-colors text-left truncate cursor-pointer',
                    isSelected
                      ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/30'
                  )}
                >
                  <span className={cn('w-4 h-4 rounded text-white flex items-center justify-center text-[10px] font-bold shrink-0', proj.color)}>
                    {proj.icon}
                  </span>
                  <span className="truncate">{proj.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Support Section */}
      <div className="px-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-0.5">
        <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-2 uppercase tracking-wider block mb-1">
          Support
        </span>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-neutral-400" />
          <span>Settings</span>
        </button>
        <button
          onClick={onOpenReleaseNotes}
          className="w-full flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer"
        >
          <Megaphone className="w-4 h-4 text-neutral-400" />
          <span>Release Notes</span>
        </button>
      </div>
    </aside>
  );
}

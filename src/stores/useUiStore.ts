'use client';

import { create } from 'zustand';

export type NavSection = 'mail' | 'calendar' | 'people' | 'todo' | 'settings';

interface UiState {
  activeSection: NavSection;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  setActiveSection: (section: NavSection) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('airsend_theme') as 'light' | 'dark' | null;
    if (saved === 'dark' || saved === 'light') return saved;
    if (document.documentElement.classList.contains('dark')) return 'dark';
  }
  return 'dark';
}

function applyThemeToDom(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  try {
    localStorage.setItem('airsend_theme', theme);
  } catch {
    // Ignore storage errors in restricted iframes or privacy mode
  }
}

export const useUiStore = create<UiState>((set) => ({
  activeSection: 'mail',
  isSidebarOpen: false,
  theme: getInitialTheme(),
  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setTheme: (theme) => {
    applyThemeToDom(theme);
    set({ theme });
  },
  toggleTheme: () => {
    set((s) => {
      const nextTheme = s.theme === 'light' ? 'dark' : 'light';
      applyThemeToDom(nextTheme);
      return { theme: nextTheme };
    });
  },
}));

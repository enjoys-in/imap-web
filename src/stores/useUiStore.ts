'use client';

import { create } from 'zustand';

export type NavSection = 'mail' | 'calendar' | 'people' | 'todo' | 'notes' | 'settings';
export type ThemeMode = 'light' | 'dark' | 'system';

interface UiState {
  activeSection: NavSection;
  isSidebarOpen: boolean;
  theme: ThemeMode;
  setActiveSection: (section: NavSection) => void;
  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('airsend_theme') as ThemeMode | null;
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    if (document.documentElement.classList.contains('dark')) return 'dark';
  }
  return 'dark';
}

function resolveIsDark(theme: ThemeMode): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
}

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const isDark = resolveIsDark(theme);
  if (isDark) {
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

if (typeof window !== 'undefined' && window.matchMedia) {
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const saved = localStorage.getItem('airsend_theme') as ThemeMode | null;
      if (saved === 'system') {
        applyThemeToDom('system');
      }
    });
  } catch {
    // Ignore unsupported browser environments
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
      const isCurrentlyDark = resolveIsDark(s.theme);
      const nextTheme: ThemeMode = isCurrentlyDark ? 'light' : 'dark';
      applyThemeToDom(nextTheme);
      return { theme: nextTheme };
    });
  },
}));

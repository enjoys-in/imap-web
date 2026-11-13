'use client';

import { create } from 'zustand';

export type RightAppId = 'calendar' | 'todo' | 'notes' | 'contacts';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  starred: boolean;
  createdAt: string;
  dueDate?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
  updatedAt: string;
  isPinned?: boolean;
}

interface RightAppsState {
  activeApp: RightAppId | null;
  todos: TodoItem[];
  notes: NoteItem[];
  toggleApp: (app: RightAppId) => void;
  closeApp: () => void;
  addTodo: (title: string, dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  starTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  addNote: (title: string, content: string, color?: NoteItem['color']) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;
}

const STORAGE_KEY = 'airsend_right_apps_data';

const INITIAL_TODOS: TodoItem[] = [
  { id: 'todo-1', title: 'Review pull request for IMAP parser', completed: false, starred: true, createdAt: new Date().toISOString() },
  { id: 'todo-2', title: 'Prepare Q4 Product Roadmap presentation', completed: false, starred: false, createdAt: new Date().toISOString() },
  { id: 'todo-3', title: 'Schedule sync with DevOps for STARTTLS deployment', completed: true, starred: false, createdAt: new Date().toISOString() },
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'SMTP Server Config',
    content: 'Host: mail.enjoys.in\nPort: 587\nUser: mullayam06@airsend.in\nSecurity: STARTTLS',
    color: 'yellow',
    updatedAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: 'note-2',
    title: 'Meeting Notes: Sprint Review',
    content: 'Key focus for next release:\n1. Multi-account tab isolation\n2. Real-time background sync\n3. Instant search indexer',
    color: 'blue',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    isPinned: true,
  },
  {
    id: 'note-3',
    title: 'IMAP Protocol Reference',
    content: 'Common RFC-3501 flags:\n- \\Seen\n- \\Answered\n- \\Flagged\n- \\Deleted\n- \\Draft\nCommands: UID SEARCH, UID FETCH, IDLE',
    color: 'green',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isPinned: false,
  },
  {
    id: 'note-4',
    title: 'Product Roadmap & Ideas',
    content: '1. Offline local database storage\n2. Color-coded sticky note boards\n3. Quick markdown export & formatting',
    color: 'purple',
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    isPinned: false,
  },
];

function loadPersistedData() {
  if (typeof window === 'undefined') return { todos: INITIAL_TODOS, notes: INITIAL_NOTES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { todos: INITIAL_TODOS, notes: INITIAL_NOTES };
    const parsed = JSON.parse(raw);
    return {
      todos: parsed.todos?.length ? parsed.todos : INITIAL_TODOS,
      notes: parsed.notes?.length ? parsed.notes : INITIAL_NOTES,
    };
  } catch {
    return { todos: INITIAL_TODOS, notes: INITIAL_NOTES };
  }
}

function persistData(todos: TodoItem[], notes: NoteItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, notes }));
  } catch {
    // ignore
  }
}

export const useRightAppsStore = create<RightAppsState>((set, get) => {
  const initial = loadPersistedData();

  return {
    activeApp: null,
    todos: initial.todos,
    notes: initial.notes,

    toggleApp: (app) =>
      set((s) => ({ activeApp: s.activeApp === app ? null : app })),

    closeApp: () => set({ activeApp: null }),

    addTodo: (title, dueDate) => {
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}`,
        title: title.trim(),
        completed: false,
        starred: false,
        createdAt: new Date().toISOString(),
        dueDate,
      };
      set((s) => {
        const next = [newTodo, ...s.todos];
        persistData(next, s.notes);
        return { todos: next };
      });
    },

    toggleTodo: (id) =>
      set((s) => {
        const next = s.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
        persistData(next, s.notes);
        return { todos: next };
      }),

    starTodo: (id) =>
      set((s) => {
        const next = s.todos.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t));
        persistData(next, s.notes);
        return { todos: next };
      }),

    deleteTodo: (id) =>
      set((s) => {
        const next = s.todos.filter((t) => t.id !== id);
        persistData(next, s.notes);
        return { todos: next };
      }),

    addNote: (title, content, color = 'yellow') => {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        color,
        updatedAt: new Date().toISOString(),
      };
      set((s) => {
        const next = [newNote, ...s.notes];
        persistData(s.todos, next);
        return { notes: next };
      });
    },

    updateNote: (id, updates) =>
      set((s) => {
        const next = s.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
        persistData(s.todos, next);
        return { notes: next };
      }),

    togglePinNote: (id) =>
      set((s) => {
        const next = s.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
        persistData(s.todos, next);
        return { notes: next };
      }),

    deleteNote: (id) =>
      set((s) => {
        const next = s.notes.filter((n) => n.id !== id);
        persistData(s.todos, next);
        return { notes: next };
      }),
  };
});

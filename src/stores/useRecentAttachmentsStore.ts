import { create } from 'zustand';

export interface RecentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  lastUsedAt: string;
}

const STORAGE_KEY = 'airsend_recent_attachments';

const DEFAULT_RECENTS: RecentAttachment[] = [];

interface RecentAttachmentsState {
  recentAttachments: RecentAttachment[];
  addRecent: (file: { name: string; size: number; type: string }) => void;
  createSyntheticFile: (rec: RecentAttachment) => File;
}

export const useRecentAttachmentsStore = create<RecentAttachmentsState>((set, get) => {
  let initial = DEFAULT_RECENTS;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) initial = JSON.parse(saved);
    } catch (_) {}
  }

  return {
    recentAttachments: initial.slice(0, 3),

    addRecent: (file) => {
      const current = get().recentAttachments.filter((f) => f.name !== file.name);
      const updated: RecentAttachment[] = [
        {
          id: `rec-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          lastUsedAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 3); // Keep only the last 3 used attachments

      set({ recentAttachments: updated });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (_) {}
      }
    },

    createSyntheticFile: (rec: RecentAttachment) => {
      const dummyContent = `Synthetic cached content for ${rec.name} (${rec.size} bytes)`;
      const blob = new Blob([dummyContent], { type: rec.type });
      return new File([blob], rec.name, { type: rec.type, lastModified: Date.now() });
    },
  };
});

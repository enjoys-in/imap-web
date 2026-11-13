import { create } from 'zustand';

export interface RecentAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  lastUsedAt: string;
}

const STORAGE_KEY = 'airsend_recent_attachments';

const DEFAULT_RECENTS: RecentAttachment[] = [
  {
    id: 'rec-1',
    name: 'Quarterly_Review_2026.pdf',
    size: 1468006, // ~1.4 MB
    type: 'application/pdf',
    lastUsedAt: '2026-11-13T10:00:00.000Z',
  },
  {
    id: 'rec-2',
    name: 'Architecture_Diagram_v2.png',
    size: 870400, // ~850 KB
    type: 'image/png',
    lastUsedAt: '2026-11-12T15:30:00.000Z',
  },
  {
    id: 'rec-3',
    name: 'Contract_Agreement_Signed.docx',
    size: 348160, // ~340 KB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    lastUsedAt: '2026-11-11T12:00:00.000Z',
  },
];

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

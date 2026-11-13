import { MailMessage } from '@/types';

const CACHE_NAME = 'airsend-cache-v1';

export const localEmailCache = {
  async saveEmail(email: MailMessage): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      const res = new Response(JSON.stringify(email), {
        headers: { 'Content-Type': 'application/json' },
      });
      await cache.put(`/emails/${email.id}`, res);
    } catch {
      // Ignore cache failure
    }
  },

  async getEmail(id: string): Promise<MailMessage | null> {
    if (typeof window === 'undefined' || !('caches' in window)) return null;
    try {
      const cache = await caches.open(CACHE_NAME);
      const res = await cache.match(`/emails/${id}`);
      if (!res) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};

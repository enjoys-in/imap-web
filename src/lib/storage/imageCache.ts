'use client';

import { useState, useEffect } from 'react';
import { CacheStorageUtil } from '@enjoys/react-api/cache-storage';

export const imageCacheStorage =
  typeof window !== 'undefined' && 'caches' in window
    ? new CacheStorageUtil('airsend-images-cache-v1')
    : null;

const memoryUrlCache = new Map<string, string>();

/**
 * Fetch and cache images/logos/avatars in browser CacheStorage via @enjoys/react-api.
 */
export async function getCachedImageUrl(url?: string | null, ttl = 7 * 24 * 60 * 60 * 1000): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return url;
  if (memoryUrlCache.has(url)) return memoryUrlCache.get(url)!;
  if (!imageCacheStorage) return url;

  try {
    const cachedBlob = await imageCacheStorage.getBlob(url);
    if (cachedBlob && cachedBlob.size > 0) {
      const objUrl = URL.createObjectURL(cachedBlob);
      memoryUrlCache.set(url, objUrl);
      return objUrl;
    }

    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return url;
    const blob = await res.blob();
    if (blob && blob.size > 0) {
      await imageCacheStorage.putBlob(url, blob, ttl);
      const objUrl = URL.createObjectURL(blob);
      memoryUrlCache.set(url, objUrl);
      return objUrl;
    }
    return url;
  } catch {
    return url;
  }
}

/**
 * React hook to retrieve an image URL from CacheStorage with graceful fallback.
 */
export function useCachedImage(rawUrl?: string | null) {
  const [src, setSrc] = useState<string | null>(rawUrl || null);

  useEffect(() => {
    if (!rawUrl) {
      setSrc(null);
      return;
    }
    let isCancelled = false;
    getCachedImageUrl(rawUrl).then((resUrl) => {
      if (!isCancelled) setSrc(resUrl);
    });
    return () => {
      isCancelled = true;
    };
  }, [rawUrl]);

  return src || rawUrl || '';
}

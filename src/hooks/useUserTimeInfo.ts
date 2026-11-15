'use client';

import { useSyncExternalStore } from 'react';
import { getUserTimeInfo, type UserTimeInfo } from '@/lib/timezoneUtils';

const REFRESH_MS = 10_000;

const listeners = new Set<() => void>();
let snapshot: UserTimeInfo | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

function isSameMinute(a: UserTimeInfo, b: UserTimeInfo): boolean {
  return a.timeZone === b.timeZone && a.tzAbbr === b.tzAbbr && a.decimalHour === b.decimalHour;
}

function refresh(): void {
  const next = getUserTimeInfo();
  if (snapshot && isSameMinute(snapshot, next)) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!timer) {
    refresh();
    timer = setInterval(refresh, REFRESH_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot(): UserTimeInfo {
  if (!snapshot) snapshot = getUserTimeInfo();
  return snapshot;
}

function getServerSnapshot(): UserTimeInfo | null {
  return null;
}

export function useUserTimeInfo(): UserTimeInfo | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

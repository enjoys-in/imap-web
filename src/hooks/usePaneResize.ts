'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'airsend_pane_widths';

export const MIN_SIDEBAR_WIDTH = 180;
export const MAX_SIDEBAR_WIDTH = 300;
export const DEFAULT_SIDEBAR = 240;

export const MIN_MAILLIST_WIDTH = 260;
export const MAX_MAILLIST_WIDTH = 460;
export const DEFAULT_MAILLIST = 340;

export const MIN_MAILLIST_HEIGHT = 160;
export const MAX_MAILLIST_HEIGHT = 460;
export const DEFAULT_MAILLIST_HEIGHT = 300;

export function usePaneResize() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const [mailListWidth, setMailListWidth] = useState(DEFAULT_MAILLIST);
  const [mailListHeight, setMailListHeight] = useState(DEFAULT_MAILLIST_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);

  // Restore persisted widths from localStorage, capping against strict maximums
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { sidebar, mailList, mailListH } = JSON.parse(saved);
        if (typeof sidebar === 'number' && sidebar >= MIN_SIDEBAR_WIDTH) {
          setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, sidebar));
        }
        if (typeof mailList === 'number' && mailList >= MIN_MAILLIST_WIDTH) {
          setMailListWidth(Math.min(MAX_MAILLIST_WIDTH, mailList));
        }
        if (typeof mailListH === 'number' && mailListH >= MIN_MAILLIST_HEIGHT) {
          setMailListHeight(Math.min(MAX_MAILLIST_HEIGHT, mailListH));
        }
      }
    } catch {
      // Ignore JSON error
    }
  }, []);

  const persist = useCallback(
    (sWidth: number, mWidth: number, mHeight?: number) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            sidebar: Math.min(MAX_SIDEBAR_WIDTH, sWidth),
            mailList: Math.min(MAX_MAILLIST_WIDTH, mWidth),
            mailListH: Math.min(MAX_MAILLIST_HEIGHT, mHeight ?? mailListHeight),
          })
        );
      } catch {
        // Ignore storage quota error
      }
    },
    [mailListHeight]
  );

  const handleSidebarResize = useCallback(
    (deltaX: number) => {
      setSidebarWidth((prev) => {
        const next = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, prev + deltaX));
        persist(next, mailListWidth);
        return next;
      });
    },
    [mailListWidth, persist]
  );

  const handleMailListResize = useCallback(
    (deltaX: number) => {
      setMailListWidth((prev) => {
        const viewportLimit = typeof window !== 'undefined'
          ? Math.max(MIN_MAILLIST_WIDTH, window.innerWidth - sidebarWidth - 360)
          : MAX_MAILLIST_WIDTH;
        const maxAllowed = Math.min(MAX_MAILLIST_WIDTH, viewportLimit);
        const next = Math.max(MIN_MAILLIST_WIDTH, Math.min(maxAllowed, prev + deltaX));
        persist(sidebarWidth, next);
        return next;
      });
    },
    [sidebarWidth, persist]
  );

  const handleMailListVerticalResize = useCallback(
    (deltaY: number) => {
      setMailListHeight((prev) => {
        const viewportLimit = typeof window !== 'undefined'
          ? Math.max(MIN_MAILLIST_HEIGHT, window.innerHeight - 300)
          : MAX_MAILLIST_HEIGHT;
        const maxAllowed = Math.min(MAX_MAILLIST_HEIGHT, viewportLimit);
        const next = Math.max(MIN_MAILLIST_HEIGHT, Math.min(maxAllowed, prev + deltaY));
        persist(sidebarWidth, mailListWidth, next);
        return next;
      });
    },
    [sidebarWidth, mailListWidth, persist]
  );

  const resetSidebar = useCallback(() => {
    setSidebarWidth(DEFAULT_SIDEBAR);
    persist(DEFAULT_SIDEBAR, mailListWidth);
  }, [mailListWidth, persist]);

  const resetMailList = useCallback(() => {
    setMailListWidth(DEFAULT_MAILLIST);
    persist(sidebarWidth, DEFAULT_MAILLIST);
  }, [sidebarWidth, persist]);

  const resetMailListHeight = useCallback(() => {
    setMailListHeight(DEFAULT_MAILLIST_HEIGHT);
    persist(sidebarWidth, mailListWidth, DEFAULT_MAILLIST_HEIGHT);
  }, [sidebarWidth, mailListWidth, persist]);

  return {
    sidebarWidth,
    mailListWidth,
    mailListHeight,
    isResizing,
    setIsResizing,
    handleSidebarResize,
    handleMailListResize,
    handleMailListVerticalResize,
    resetSidebar,
    resetMailList,
    resetMailListHeight,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'airsend_pane_widths';
const DEFAULT_SIDEBAR = 240;
const DEFAULT_MAILLIST = 340;
const DEFAULT_MAILLIST_HEIGHT = 320;

export function usePaneResize() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const [mailListWidth, setMailListWidth] = useState(DEFAULT_MAILLIST);
  const [mailListHeight, setMailListHeight] = useState(DEFAULT_MAILLIST_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);

  // Restore persisted widths from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { sidebar, mailList, mailListH } = JSON.parse(saved);
        if (sidebar >= 180 && sidebar <= 400) setSidebarWidth(sidebar);
        if (mailList >= 260 && mailList <= 800) setMailListWidth(mailList);
        if (mailListH >= 160 && mailListH <= 700) setMailListHeight(mailListH);
      }
    } catch {
      // Ignore JSON error
    }
  }, []);

  const persist = useCallback((sWidth: number, mWidth: number, mHeight?: number) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sidebar: sWidth,
          mailList: mWidth,
          mailListH: mHeight ?? mailListHeight,
        })
      );
    } catch {
      // Ignore storage quota error
    }
  }, [mailListHeight]);

  const handleSidebarResize = useCallback(
    (deltaX: number) => {
      setSidebarWidth((prev) => {
        const next = Math.max(180, Math.min(400, prev + deltaX));
        persist(next, mailListWidth);
        return next;
      });
    },
    [mailListWidth, persist]
  );

  const handleMailListResize = useCallback(
    (deltaX: number) => {
      setMailListWidth((prev) => {
        const maxAllowed = typeof window !== 'undefined'
          ? Math.max(320, window.innerWidth - sidebarWidth - 340)
          : 750;
        const next = Math.max(260, Math.min(maxAllowed, prev + deltaX));
        persist(sidebarWidth, next);
        return next;
      });
    },
    [sidebarWidth, persist]
  );

  const handleMailListVerticalResize = useCallback(
    (deltaY: number) => {
      setMailListHeight((prev) => {
        const maxAllowed = typeof window !== 'undefined'
          ? Math.max(200, window.innerHeight - 300)
          : 600;
        const next = Math.max(160, Math.min(maxAllowed, prev + deltaY));
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
    // Smart auto-adjust: 340px or ~30% of available window width
    const autoWidth = typeof window !== 'undefined'
      ? Math.max(300, Math.min(420, Math.floor((window.innerWidth - sidebarWidth) * 0.35)))
      : DEFAULT_MAILLIST;
    setMailListWidth(autoWidth);
    persist(sidebarWidth, autoWidth);
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

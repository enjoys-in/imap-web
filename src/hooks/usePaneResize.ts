'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'airsend_pane_widths';
const DEFAULT_SIDEBAR = 240;
const DEFAULT_MAILLIST = 340;

export function usePaneResize() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const [mailListWidth, setMailListWidth] = useState(DEFAULT_MAILLIST);
  const [isResizing, setIsResizing] = useState(false);

  // Restore persisted widths from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { sidebar, mailList } = JSON.parse(saved);
        if (sidebar >= 180 && sidebar <= 400) setSidebarWidth(sidebar);
        if (mailList >= 260 && mailList <= 650) setMailListWidth(mailList);
      }
    } catch {
      // Ignore JSON error
    }
  }, []);

  const persist = useCallback((sWidth: number, mWidth: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sidebar: sWidth, mailList: mWidth }));
    } catch {
      // Ignore storage quota error
    }
  }, []);

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
        const next = Math.max(260, Math.min(650, prev + deltaX));
        persist(sidebarWidth, next);
        return next;
      });
    },
    [sidebarWidth, persist]
  );

  const resetSidebar = useCallback(() => {
    setSidebarWidth(DEFAULT_SIDEBAR);
    persist(DEFAULT_SIDEBAR, mailListWidth);
  }, [mailListWidth, persist]);

  const resetMailList = useCallback(() => {
    setMailListWidth(DEFAULT_MAILLIST);
    persist(sidebarWidth, DEFAULT_MAILLIST);
  }, [sidebarWidth, persist]);

  return {
    sidebarWidth,
    mailListWidth,
    isResizing,
    setIsResizing,
    handleSidebarResize,
    handleMailListResize,
    resetSidebar,
    resetMailList,
  };
}

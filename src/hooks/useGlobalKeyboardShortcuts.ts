'use client';

import { useState, useEffect } from 'react';
import { useMailStore, useComposeStore } from '@/stores';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';

export function useGlobalKeyboardShortcuts() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      // Handle Escape anywhere
      if (e.key === 'Escape') {
        setIsHelpOpen(false);
        return;
      }

      // If typing inside an input, don't trigger single-letter triage shortcuts
      if (isInput) return;

      const mailStore = useMailStore.getState();
      const composeStore = useComposeStore.getState();
      const { selectedMailId, localEmails, setSelectedMail } = mailStore;

      // 1. Show shortcuts cheatsheet with '?'
      if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // 2. Compose with 'C'
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        composeStore.openNew();
        return;
      }

      // 3. Search with '/'
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="Search" i]'
        );
        searchInput?.focus();
        searchInput?.select();
        return;
      }

      // 4. Navigation J (Next) / K (Previous)
      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        if (localEmails.length > 0) {
          e.preventDefault();
          const currentIndex = localEmails.findIndex((m) => m.id === selectedMailId);
          const nextIndex = currentIndex < localEmails.length - 1 ? currentIndex + 1 : 0;
          setSelectedMail(localEmails[nextIndex].id);
        }
        return;
      }

      if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        if (localEmails.length > 0) {
          e.preventDefault();
          const currentIndex = localEmails.findIndex((m) => m.id === selectedMailId);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : localEmails.length - 1;
          setSelectedMail(localEmails[prevIndex].id);
        }
        return;
      }

      // If no email is selected, the following triage actions require an active message
      if (!selectedMailId) return;
      const currentEmail = localEmails.find((m) => m.id === selectedMailId);

      // 5. Archive with 'E' or 'Y'
      if (e.key === 'e' || e.key === 'E' || e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        dispatchMailAction({
          action: 'archive',
          targetEmailId: selectedMailId,
          targetEmail: currentEmail,
        });
        return;
      }

      // 6. Delete with '#' or 'Delete'
      if (e.key === '#' || e.key === 'Delete') {
        e.preventDefault();
        dispatchMailAction({
          action: 'delete',
          targetEmailId: selectedMailId,
          targetEmail: currentEmail,
        });
        return;
      }

      // 7. Flag with 'S'
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        dispatchMailAction({
          action: 'toggle-flag',
          targetEmailId: selectedMailId,
          targetEmail: currentEmail,
        });
        return;
      }

      // 8. Mark Read/Unread with 'U'
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        dispatchMailAction({
          action: currentEmail?.isRead ? 'mark-unread' : 'mark-read',
          targetEmailId: selectedMailId,
          targetEmail: currentEmail,
        });
        return;
      }

      // 9. Reply with 'R'
      if (e.key === 'r' || e.key === 'R') {
        if (currentEmail) {
          e.preventDefault();
          composeStore.openReply(currentEmail, false);
        }
        return;
      }

      // 10. Reply All with 'A'
      if (e.key === 'a' || e.key === 'A') {
        if (currentEmail) {
          e.preventDefault();
          composeStore.openReply(currentEmail, true);
        }
        return;
      }

      // 11. Forward with 'F'
      if (e.key === 'f' || e.key === 'F') {
        if (currentEmail) {
          e.preventDefault();
          composeStore.openForward(currentEmail);
        }
        return;
      }

      // 12. Snooze with 'H'
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        mailStore.snoozeEmail(selectedMailId, 'Tomorrow 8:00 AM');
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isHelpOpen,
    setIsHelpOpen,
  };
}

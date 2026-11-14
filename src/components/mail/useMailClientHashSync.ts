'use client';

import { useEffect, useCallback } from 'react';
import { useMailStore } from '@/stores';
import { folderIdToSlug, slugToFolderId } from '@/lib/folderSlugUtils';
import { emailsApi } from '@/lib/api';
import { saveOpenMailSession } from '@/lib/storage/mailSessionStorage';

export function parseMailHash(rawHash: string) {
  const clean = rawHash.replace(/^#\/?/, '').trim();
  if (!clean) return { folderSlug: 'inbox', mailId: null };
  const parts = clean.split('/').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { folderSlug: 'inbox', mailId: null };
  if (parts.length >= 2) return { folderSlug: parts[0], mailId: parts[1] };
  if (parts[0].startsWith('msg-')) return { folderSlug: 'inbox', mailId: parts[0] };
  return { folderSlug: parts[0], mailId: null };
}

export function useMailClientHashSync(parsedUserIndex: number) {
  const setSelectedFolder = useMailStore((s) => s.setSelectedFolder);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const addOrSelectEmail = useMailStore((s) => s.addOrSelectEmail);

  const syncFromHash = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const clean = window.location.hash.replace(/^#\/?/, '').trim();

    if (!clean) {
      const targetFolderId = 'fld-inbox';
      const targetSlug = 'inbox';
      setSelectedFolder(targetFolderId);
      setSelectedMail(null);
      saveOpenMailSession(parsedUserIndex, targetFolderId, targetSlug, null);
      if (window.location.hash !== '#inbox') {
        window.history.replaceState(null, '', `/mail/u/${parsedUserIndex}#inbox`);
      }
      return;
    }

    const { folderSlug, mailId } = parseMailHash(window.location.hash);
    const targetFolderId = slugToFolderId(folderSlug);
    setSelectedFolder(targetFolderId);

    if (mailId) {
      const exists = useMailStore.getState().localEmails.some((e) => e.id === mailId);
      if (exists) {
        setSelectedMail(mailId);
        saveOpenMailSession(parsedUserIndex, targetFolderId, folderSlug, mailId);
      } else {
        const fetched = await emailsApi.getEmailById(mailId);
        if (fetched) {
          addOrSelectEmail(fetched);
          saveOpenMailSession(parsedUserIndex, targetFolderId, folderSlug, mailId);
        } else {
          window.history.replaceState(null, '', `/mail/u/${parsedUserIndex}#${folderSlug}`);
          setSelectedMail(null);
          saveOpenMailSession(parsedUserIndex, targetFolderId, folderSlug, null);
        }
      }
    } else {
      setSelectedMail(null);
      saveOpenMailSession(parsedUserIndex, targetFolderId, folderSlug, null);
      if (window.location.hash !== `#${folderSlug}`) {
        window.history.replaceState(null, '', `/mail/u/${parsedUserIndex}#${folderSlug}`);
      }
    }
  }, [parsedUserIndex, setSelectedFolder, setSelectedMail, addOrSelectEmail]);

  useEffect(() => {
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [syncFromHash]);
}

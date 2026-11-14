'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useMailStore } from '@/stores';
import { findFolderBySlug, findSpecialFolder, folderSlug as toFolderSlug } from '@/lib/folders';
import { emailsApi } from '@/lib/api';
import { saveOpenMailSession } from '@/lib/storage/mailSessionStorage';
import type { MailFolder } from '@/types';

export function parseMailHash(rawHash: string) {
  const clean = rawHash.replace(/^#\/?/, '').trim();
  if (!clean) return { folderSlug: 'inbox', mailId: null };
  const parts = clean.split('/').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { folderSlug: 'inbox', mailId: null };
  if (parts.length >= 2) return { folderSlug: parts[0], mailId: parts[1] };
  if (parts[0].startsWith('msg-')) return { folderSlug: 'inbox', mailId: parts[0] };
  return { folderSlug: parts[0], mailId: null };
}

/**
 * Keeps the store in step with the URL hash (#inbox, #sent/msg-12, ...).
 * Folder slugs are resolved against the folder list the backend sent, so the
 * sync waits until that list is available.
 */
export function useMailClientHashSync(parsedUserIndex: number, folders: MailFolder[] | undefined) {
  const setSelectedFolder = useMailStore((s) => s.setSelectedFolder);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const addOrSelectEmail = useMailStore((s) => s.addOrSelectEmail);

  // Latest folder list without re-running the sync each time the list is refreshed.
  const foldersRef = useRef(folders);
  useEffect(() => {
    foldersRef.current = folders;
  }, [folders]);
  // Changes when folders first arrive or the account changes, not on every refresh.
  const folderSetKey = folders?.length ? folders[0].accountId : '';

  const syncFromHash = useCallback(async () => {
    const list = foldersRef.current;
    if (typeof window === 'undefined' || !list?.length) return;

    const inbox = findSpecialFolder(list, 'Inbox') ?? list[0];
    const clean = window.location.hash.replace(/^#\/?/, '').trim();

    if (!clean) {
      const slug = toFolderSlug(inbox);
      setSelectedFolder(inbox.id);
      setSelectedMail(null);
      saveOpenMailSession(parsedUserIndex, inbox.id, slug, null);
      if (window.location.hash !== `#${slug}`) {
        window.history.replaceState(null, '', `/mail/u/${parsedUserIndex}#${slug}`);
      }
      return;
    }

    const { folderSlug: hashSlug, mailId } = parseMailHash(window.location.hash);
    const folder = findFolderBySlug(list, hashSlug) ?? inbox;
    const slug = toFolderSlug(folder);
    setSelectedFolder(folder.id);

    if (mailId) {
      const exists = useMailStore.getState().localEmails.some((e) => e.id === mailId);
      if (exists) {
        setSelectedMail(mailId);
        saveOpenMailSession(parsedUserIndex, folder.id, slug, mailId);
      } else {
        const fetched = await emailsApi.getEmailById(mailId);
        if (fetched) {
          addOrSelectEmail(fetched);
          saveOpenMailSession(parsedUserIndex, folder.id, slug, mailId);
        } else {
          window.history.replaceState(null, '', `/mail/u/${parsedUserIndex}#${slug}`);
          setSelectedMail(null);
          saveOpenMailSession(parsedUserIndex, folder.id, slug, null);
        }
      }
    } else {
      setSelectedMail(null);
      saveOpenMailSession(parsedUserIndex, folder.id, slug, null);
      if (window.location.hash !== `#${slug}`) {
        window.history.replaceState(null, '', `/mail/u/${parsedUserIndex}#${slug}`);
      }
    }
  }, [parsedUserIndex, setSelectedFolder, setSelectedMail, addOrSelectEmail]);

  useEffect(() => {
    if (!folderSetKey) return;
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [folderSetKey, syncFromHash]);
}

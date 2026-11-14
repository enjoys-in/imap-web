import { useMailStore, useComposeStore, useToastStore } from '@/stores';
import { MailActionEventDetail } from '@/lib/events/mailActionEvents';
import { handleCoreMailAction } from './mailActionCore';
import { handleAdvancedMailAction } from './mailActionAdvanced';

/**
 * Central action processor for all email actions dispatched across the application.
 * Executes optimistic store updates, calls real backend IMAP/REST APIs, and triggers user toasts.
 */
export function dispatchMailAction(detail: MailActionEventDetail) {
  if (!detail || !detail.action) return;

  const mailStore = useMailStore.getState();
  const composeStore = useComposeStore.getState();
  const toastStore = useToastStore.getState();

  const { selectedIds, selectedMailId, localEmails, undoLastAction, setSelectedMail, clearSelectedIds } = mailStore;

  let explicitEmail = detail.targetEmail || null;
  if (!explicitEmail && detail.targetEmailId) {
    explicitEmail = localEmails.find((e) => e.id === detail.targetEmailId) || null;
  }
  const activeEmail = (explicitEmail || localEmails.find((e) => e.id === selectedMailId) || null) as any;
  const hasExplicitTarget = Boolean(detail.targetEmailId);
  const hasBulkSelection = !hasExplicitTarget && selectedIds.length > 0;
  const hasTarget = hasExplicitTarget || hasBulkSelection || Boolean(activeEmail);

  // 1. Try Core Actions (delete, archive, move, copy, categorize, snooze, flag, pin, read)
  const handledCore = handleCoreMailAction(detail, activeEmail, explicitEmail as any, hasTarget, hasExplicitTarget, hasBulkSelection);
  if (handledCore) return;

  // 2. Try Advanced & Security Actions (junk, phishing, concern, block, allow, mute, search, task, contact, eml, source)
  const handledAdv = handleAdvancedMailAction(detail, activeEmail, hasTarget, hasExplicitTarget, hasBulkSelection);
  if (handledAdv) return;

  // 3. Communications & UI Actions
  switch (detail.action) {
    case 'reply':
      if (activeEmail) composeStore.openReply(activeEmail, false);
      break;

    case 'reply-all':
      if (activeEmail) composeStore.openReply(activeEmail, true);
      break;

    case 'forward':
      if (activeEmail) composeStore.openForward(activeEmail);
      break;

    case 'undo': {
      const ok = undoLastAction();
      toastStore.addToast({
        title: ok ? 'Action Undone' : 'Nothing to Undo',
        description: ok ? 'Restored previous state' : 'No recent actions to revert',
        type: 'info',
      });
      break;
    }

    case 'deselect':
      setSelectedMail(null);
      clearSelectedIds();
      if (typeof window !== 'undefined' && window.location.hash.includes('/')) {
        const folderPart = window.location.hash.split('/')[0];
        window.history.replaceState(null, '', folderPart);
      }
      toastStore.addToast({ title: 'Deselected', description: 'Cleared active selection', type: 'info' });
      break;
  }
}

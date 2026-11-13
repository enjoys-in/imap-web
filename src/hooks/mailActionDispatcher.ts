import { useMailStore, useComposeStore, useToastStore } from '@/stores';
import { emailsApi } from '@/lib/api';
import { MailActionEventDetail } from '@/lib/events/mailActionEvents';

export function dispatchMailAction(detail: MailActionEventDetail) {
  if (!detail || !detail.action) return;

  const mailStore = useMailStore.getState();
  const composeStore = useComposeStore.getState();
  const toastStore = useToastStore.getState();

  const {
    selectedIds, selectedMailId, localEmails, selectedFolderId,
    deleteEmail, bulkDelete, moveEmailToFolder, bulkMoveToFolder,
    markAsRead, bulkMarkAsRead, toggleFlag, bulkToggleFlag,
    togglePin, snoozeEmail, undoLastAction, setSelectedMail, clearSelectedIds,
  } = mailStore;

  const folder = selectedFolderId || 'INBOX';

  let explicitEmail = detail.targetEmail || null;
  if (!explicitEmail && detail.targetEmailId) {
    explicitEmail = localEmails.find((e) => e.id === detail.targetEmailId) || null;
  }
  const activeEmail = explicitEmail || localEmails.find((e) => e.id === selectedMailId) || null;
  const hasExplicitTarget = Boolean(detail.targetEmailId);
  const hasBulkSelection = !hasExplicitTarget && selectedIds.length > 0;
  const hasTarget = hasExplicitTarget || hasBulkSelection || Boolean(activeEmail);

  switch (detail.action) {
    case 'delete':
      if (!hasTarget) return;
      if (hasExplicitTarget && detail.targetEmailId) {
        deleteEmail(detail.targetEmailId);
        emailsApi.deleteEmail(detail.targetEmailId, folder);
        toastStore.addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
      } else if (hasBulkSelection) {
        const count = selectedIds.length;
        const ids = [...selectedIds];
        bulkDelete();
        emailsApi.bulkDeleteEmails(ids, folder);
        toastStore.addToast({ title: 'Deleted', description: `${count} conversations deleted`, type: 'info' });
      } else if (activeEmail) {
        deleteEmail(activeEmail.id);
        emailsApi.deleteEmail(activeEmail.id, folder);
        toastStore.addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
      }
      break;

    case 'archive':
      if (!hasTarget) return;
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, 'fld-archive');
        emailsApi.moveEmail(detail.targetEmailId, 'fld-archive', folder);
      } else if (hasBulkSelection) {
        bulkMoveToFolder('fld-archive');
        emailsApi.bulkMoveEmails([...selectedIds], 'fld-archive', folder);
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, 'fld-archive');
        emailsApi.moveEmail(activeEmail.id, 'fld-archive', folder);
      }
      toastStore.addToast({ title: 'Archived', description: 'Moved to Archive', type: 'success' });
      break;

    case 'move-to':
      if (!hasTarget) return;
      const targetFolder = detail.folderId || 'fld-archive';
      const targetName = detail.folderName || 'Selected Folder';
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, targetFolder);
        emailsApi.moveEmail(detail.targetEmailId, targetFolder, folder);
      } else if (hasBulkSelection) {
        bulkMoveToFolder(targetFolder);
        emailsApi.bulkMoveEmails([...selectedIds], targetFolder, folder);
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, targetFolder);
        emailsApi.moveEmail(activeEmail.id, targetFolder, folder);
      }
      toastStore.addToast({ title: 'Moved', description: `Moved to ${targetName}`, type: 'success' });
      break;

    case 'report-junk':
      if (!hasTarget) return;
      if (hasExplicitTarget && detail.targetEmailId) moveEmailToFolder(detail.targetEmailId, 'fld-junk');
      else if (hasBulkSelection) bulkMoveToFolder('fld-junk');
      else if (activeEmail) moveEmailToFolder(activeEmail.id, 'fld-junk');
      toastStore.addToast({ title: 'Reported Junk', description: 'Moved to Junk Email', type: 'warning' });
      break;

    case 'report-phishing':
      if (!hasTarget) return;
      if (hasExplicitTarget && detail.targetEmailId) moveEmailToFolder(detail.targetEmailId, 'fld-junk');
      else if (hasBulkSelection) bulkMoveToFolder('fld-junk');
      else if (activeEmail) moveEmailToFolder(activeEmail.id, 'fld-junk');
      toastStore.addToast({ title: 'Reported Phishing', description: 'Sender blocked & alert logged', type: 'warning' });
      break;

    case 'reply':
      if (activeEmail) composeStore.openReply(activeEmail, false);
      break;
    case 'reply-all':
      if (activeEmail) composeStore.openReply(activeEmail, true);
      break;
    case 'forward':
      if (activeEmail) composeStore.openForward(activeEmail);
      break;

    case 'toggle-read':
    case 'mark-read':
    case 'mark-unread':
      if (!hasTarget) return;
      const nextRead = detail.action === 'mark-read' ? true : detail.action === 'mark-unread' ? false : activeEmail ? !activeEmail.isRead : true;
      if (hasExplicitTarget && detail.targetEmailId) {
        markAsRead(detail.targetEmailId, nextRead);
        emailsApi.markAsRead(detail.targetEmailId, nextRead, folder);
      } else if (hasBulkSelection) {
        bulkMarkAsRead(nextRead);
        emailsApi.bulkMarkAsRead([...selectedIds], nextRead, folder);
      } else if (activeEmail) {
        markAsRead(activeEmail.id, nextRead);
        emailsApi.markAsRead(activeEmail.id, nextRead, folder);
      }
      toastStore.addToast({ title: nextRead ? 'Marked as read' : 'Marked as unread', description: '', type: 'info' });
      break;

    case 'toggle-flag':
      if (!hasTarget) return;
      if (hasExplicitTarget && detail.targetEmailId) {
        toggleFlag(detail.targetEmailId);
      } else if (hasBulkSelection) {
        bulkToggleFlag(true);
      } else if (activeEmail) {
        toggleFlag(activeEmail.id);
      }
      toastStore.addToast({ title: 'Flag Updated', description: '', type: 'info' });
      break;

    case 'toggle-pin':
      const pinId = detail.targetEmailId || activeEmail?.id;
      if (pinId) togglePin(pinId);
      break;

    case 'undo':
      undoLastAction();
      toastStore.addToast({ title: 'Action Undone', description: 'Restored previous state', type: 'info' });
      break;

    case 'deselect':
      setSelectedMail(null);
      clearSelectedIds();
      break;
  }
}

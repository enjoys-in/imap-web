import { useMailStore, useToastStore } from '@/stores';
import { emailsApi } from '@/lib/api';
import { MailActionEventDetail } from '@/lib/events/mailActionEvents';
import { MailMessage } from '@/types';

export function handleCoreMailAction(
  detail: MailActionEventDetail,
  activeEmail: MailMessage | null,
  explicitEmail: MailMessage | null,
  hasTarget: boolean,
  hasExplicitTarget: boolean,
  hasBulkSelection: boolean,
  folder: string
): boolean {
  const mailStore = useMailStore.getState();
  const toastStore = useToastStore.getState();
  const { selectedIds, localEmails, deleteEmail, bulkDelete, moveEmailToFolder, bulkMoveToFolder, copyEmailToFolder, categorizeEmail, markAsRead, bulkMarkAsRead, toggleFlag, bulkToggleFlag, togglePin, snoozeEmail, clearSelectedIds } = mailStore;

  switch (detail.action) {
    case 'delete':
      if (!hasTarget) return true;
      if (hasExplicitTarget && detail.targetEmailId) {
        deleteEmail(detail.targetEmailId);
        emailsApi.deleteEmail(detail.targetEmailId, folder).catch(() => {});
        toastStore.addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
      } else if (hasBulkSelection) {
        const count = selectedIds.length;
        const ids = [...selectedIds];
        bulkDelete();
        emailsApi.bulkDeleteEmails(ids, folder).catch(() => {});
        toastStore.addToast({ title: 'Deleted', description: `${count} conversations deleted`, type: 'info' });
      } else if (activeEmail) {
        deleteEmail(activeEmail.id);
        emailsApi.deleteEmail(activeEmail.id, folder).catch(() => {});
        toastStore.addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
      }
      return true;

    case 'archive': {
      if (!hasTarget) return true;
      const archiveFolder = 'fld-archive';
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, archiveFolder);
        emailsApi.moveEmail(detail.targetEmailId, archiveFolder, folder).catch(() => {});
      } else if (hasBulkSelection) {
        const ids = [...selectedIds];
        bulkMoveToFolder(archiveFolder);
        emailsApi.bulkMoveEmails(ids, archiveFolder, folder).catch(() => {});
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, archiveFolder);
        emailsApi.moveEmail(activeEmail.id, archiveFolder, folder).catch(() => {});
      }
      toastStore.addToast({ title: 'Archived', description: 'Moved to Archive', type: 'success' });
      return true;
    }

    case 'move-to': {
      if (!hasTarget) return true;
      const targetFolder = detail.folderId || 'fld-archive';
      const targetName = detail.folderName || 'Selected Folder';
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, targetFolder);
        emailsApi.moveEmail(detail.targetEmailId, targetFolder, folder).catch(() => {});
      } else if (hasBulkSelection) {
        const ids = [...selectedIds];
        bulkMoveToFolder(targetFolder);
        emailsApi.bulkMoveEmails(ids, targetFolder, folder).catch(() => {});
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, targetFolder);
        emailsApi.moveEmail(activeEmail.id, targetFolder, folder).catch(() => {});
      }
      toastStore.addToast({ title: 'Moved', description: `Moved to ${targetName}`, type: 'success' });
      return true;
    }

    case 'copy-to': {
      if (!hasTarget) return true;
      const targetFolder = detail.folderId || 'fld-inbox';
      const targetName = detail.folderName || 'Inbox';
      if (hasExplicitTarget && detail.targetEmailId) {
        copyEmailToFolder(detail.targetEmailId, targetFolder);
      } else if (hasBulkSelection) {
        selectedIds.forEach((id) => copyEmailToFolder(id, targetFolder));
      } else if (activeEmail) {
        copyEmailToFolder(activeEmail.id, targetFolder);
      }
      toastStore.addToast({ title: 'Copied', description: `Copied message to ${targetName}`, type: 'success' });
      return true;
    }

    case 'categorize': {
      if (!hasTarget) return true;
      const category = detail.category ?? null;
      if (hasExplicitTarget && detail.targetEmailId) {
        categorizeEmail(detail.targetEmailId, category);
      } else if (hasBulkSelection) {
        selectedIds.forEach((id) => categorizeEmail(id, category));
      } else if (activeEmail) {
        categorizeEmail(activeEmail.id, category);
      }
      toastStore.addToast({
        title: category ? 'Categorized' : 'Categories Cleared',
        description: category ? `Tagged with ${category}` : 'Removed all category labels',
        type: 'info',
      });
      return true;
    }

    case 'snooze': {
      if (!hasTarget) return true;
      const snoozeUntil = detail.snoozeUntil || 'Tomorrow 8:00 AM';
      if (hasExplicitTarget && detail.targetEmailId) {
        snoozeEmail(detail.targetEmailId, snoozeUntil);
      } else if (hasBulkSelection) {
        selectedIds.forEach((id) => snoozeEmail(id, snoozeUntil));
        clearSelectedIds();
      } else if (activeEmail) {
        snoozeEmail(activeEmail.id, snoozeUntil);
      }
      toastStore.addToast({ title: 'Email Snoozed', description: `Conversation snoozed until ${snoozeUntil}`, type: 'info' });
      return true;
    }

    case 'toggle-read':
    case 'mark-read':
    case 'mark-unread': {
      if (!hasTarget) return true;
      const nextRead = detail.action === 'mark-read' ? true : detail.action === 'mark-unread' ? false : activeEmail ? !activeEmail.isRead : true;
      if (hasExplicitTarget && detail.targetEmailId) {
        markAsRead(detail.targetEmailId, nextRead);
        emailsApi.markAsRead(detail.targetEmailId, nextRead, folder).catch(() => {});
      } else if (hasBulkSelection) {
        bulkMarkAsRead(nextRead);
        emailsApi.bulkMarkAsRead([...selectedIds], nextRead, folder).catch(() => {});
      } else if (activeEmail) {
        markAsRead(activeEmail.id, nextRead);
        emailsApi.markAsRead(activeEmail.id, nextRead, folder).catch(() => {});
      }
      toastStore.addToast({ title: nextRead ? 'Marked as read' : 'Marked as unread', description: activeEmail?.subject || '', type: 'info' });
      return true;
    }

    case 'toggle-flag': {
      if (!hasTarget) return true;
      if (hasExplicitTarget && detail.targetEmailId) {
        const nextFlag = explicitEmail ? !explicitEmail.isFlagged : true;
        toggleFlag(detail.targetEmailId);
        emailsApi.toggleFlag(detail.targetEmailId, nextFlag).catch(() => {});
      } else if (hasBulkSelection) {
        bulkToggleFlag(true);
        emailsApi.bulkToggleFlag([...selectedIds], true).catch(() => {});
      } else if (activeEmail) {
        const nextFlag = !activeEmail.isFlagged;
        toggleFlag(activeEmail.id);
        emailsApi.toggleFlag(activeEmail.id, nextFlag).catch(() => {});
      }
      toastStore.addToast({ title: 'Flag Updated', description: activeEmail?.subject || '', type: 'info' });
      return true;
    }

    case 'set-flag-due': {
      if (!hasTarget) return true;
      const label = detail.dueDateLabel || 'Today';
      if (label === 'Clear flag') {
        if (activeEmail && activeEmail.isFlagged) toggleFlag(activeEmail.id);
        toastStore.addToast({ title: 'Flag Cleared', description: 'Removed follow-up flag', type: 'info' });
      } else {
        if (activeEmail && !activeEmail.isFlagged) toggleFlag(activeEmail.id);
        toastStore.addToast({ title: 'Flagged for Follow-up', description: `Due: ${label}`, type: 'info' });
      }
      return true;
    }

    case 'toggle-pin': {
      const pinId = detail.targetEmailId || activeEmail?.id;
      if (pinId) {
        const email = localEmails.find((e) => e.id === pinId);
        const nextPinned = email ? !email.isPinned : true;
        togglePin(pinId);
        toastStore.addToast({ title: nextPinned ? 'Pinned to Top' : 'Unpinned', description: email?.subject || '', type: 'info' });
      }
      return true;
    }

    default:
      return false;
  }
}

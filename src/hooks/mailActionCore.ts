import { useMailStore, useToastStore } from '@/stores';
import { requireSpecialFolder } from './mailActionFolders';
import { MailActionEventDetail } from '@/lib/events/mailActionEvents';
import { MailMessage } from '@/types';

export function handleCoreMailAction(
  detail: MailActionEventDetail,
  activeEmail: MailMessage | null,
  explicitEmail: MailMessage | null,
  hasTarget: boolean,
  hasExplicitTarget: boolean,
  hasBulkSelection: boolean
): boolean {
  const mailStore = useMailStore.getState();
  const toastStore = useToastStore.getState();
  const { selectedIds, localEmails, deleteEmail, bulkDelete, moveEmailToFolder, bulkMoveToFolder, copyEmailToFolder, categorizeEmail, markAsRead, bulkMarkAsRead, toggleFlag, bulkToggleFlag, togglePin, snoozeEmail, clearSelectedIds } = mailStore;

  switch (detail.action) {
    case 'delete':
      if (!hasTarget) return true;
      if (hasExplicitTarget && detail.targetEmailId) {
        deleteEmail(detail.targetEmailId);
        toastStore.addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
      } else if (hasBulkSelection) {
        const count = selectedIds.length;
        bulkDelete();
        toastStore.addToast({ title: 'Deleted', description: `${count} conversations deleted`, type: 'info' });
      } else if (activeEmail) {
        deleteEmail(activeEmail.id);
        toastStore.addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
      }
      return true;

    case 'archive': {
      if (!hasTarget) return true;
      const archive = requireSpecialFolder('Archive', 'Archive');
      if (!archive) return true;
      const archiveFolder = archive.id;
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, archiveFolder);
      } else if (hasBulkSelection) {
        bulkMoveToFolder(archiveFolder);
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, archiveFolder);
      }
      toastStore.addToast({ title: 'Archived', description: 'Moved to Archive', type: 'success' });
      return true;
    }

    case 'move-to': {
      if (!hasTarget) return true;
      const targetFolder = detail.folderId;
      if (!targetFolder) return true;
      const targetName = detail.folderName || 'Selected Folder';
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, targetFolder);
      } else if (hasBulkSelection) {
        bulkMoveToFolder(targetFolder);
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, targetFolder);
      }
      toastStore.addToast({ title: 'Moved', description: `Moved to ${targetName}`, type: 'success' });
      return true;
    }

    case 'copy-to': {
      if (!hasTarget) return true;
      const targetFolder = detail.folderId;
      if (!targetFolder) return true;
      const targetName = detail.folderName || 'Selected Folder';
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
      } else if (hasBulkSelection) {
        bulkMarkAsRead(nextRead);
      } else if (activeEmail) {
        markAsRead(activeEmail.id, nextRead);
      }
      toastStore.addToast({ title: nextRead ? 'Marked as read' : 'Marked as unread', description: activeEmail?.subject || '', type: 'info' });
      return true;
    }

    case 'toggle-flag': {
      if (!hasTarget) return true;
      if (hasExplicitTarget && detail.targetEmailId) {
        toggleFlag(detail.targetEmailId);
      } else if (hasBulkSelection) {
        bulkToggleFlag(true);
      } else if (activeEmail) {
        toggleFlag(activeEmail.id);
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

import { useMailStore, useToastStore } from '@/stores';
import { emailsApi } from '@/lib/api';
import { MailActionEventDetail } from '@/lib/events/mailActionEvents';

export function handleMoveAction(
  detail: MailActionEventDetail,
  targetFolder: string,
  toastTitle: string,
  toastDesc: string,
  toastType: 'success' | 'warning' = 'success'
) {
  const { selectedIds, localEmails, selectedFolderId, moveEmailToFolder, bulkMoveToFolder, selectedMailId } =
    useMailStore.getState();
  const folder = selectedFolderId || 'INBOX';
  const targetId = detail.targetEmailId || (selectedIds.length === 0 ? selectedMailId : null);

  if (targetId) {
    moveEmailToFolder(targetId, targetFolder);
    emailsApi.moveEmail(targetId, targetFolder, folder).catch(() => {});
  } else if (selectedIds.length > 0) {
    const ids = [...selectedIds];
    bulkMoveToFolder(targetFolder);
    emailsApi.bulkMoveEmails(ids, targetFolder, folder).catch(() => {});
  }
  useToastStore.getState().addToast({ title: toastTitle, description: toastDesc, type: toastType });
}

export function handleDeleteAction(detail: MailActionEventDetail) {
  const { selectedIds, selectedFolderId, deleteEmail, bulkDelete, selectedMailId } = useMailStore.getState();
  const folder = selectedFolderId || 'INBOX';
  const targetId = detail.targetEmailId || (selectedIds.length === 0 ? selectedMailId : null);

  if (targetId) {
    deleteEmail(targetId);
    emailsApi.deleteEmail(targetId, folder).catch(() => {});
    useToastStore.getState().addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
  } else if (selectedIds.length > 0) {
    const count = selectedIds.length;
    const ids = [...selectedIds];
    bulkDelete();
    emailsApi.bulkDeleteEmails(ids, folder).catch(() => {});
    useToastStore.getState().addToast({ title: 'Deleted', description: `${count} conversations deleted`, type: 'info' });
  }
}

export function handleSnoozeAction(detail: MailActionEventDetail) {
  const { selectedIds, snoozeEmail, clearSelectedIds, selectedMailId } = useMailStore.getState();
  const snoozeUntil = detail.snoozeUntil || 'Tomorrow 8:00 AM';
  const targetId = detail.targetEmailId || (selectedIds.length === 0 ? selectedMailId : null);

  if (targetId) {
    snoozeEmail(targetId, snoozeUntil);
  } else if (selectedIds.length > 0) {
    selectedIds.forEach((id) => snoozeEmail(id, snoozeUntil));
    clearSelectedIds();
  }
  useToastStore.getState().addToast({
    title: 'Email Snoozed',
    description: `Conversation snoozed until ${snoozeUntil}`,
    type: 'info',
  });
}

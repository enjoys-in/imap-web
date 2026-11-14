import { useMailStore, useToastStore } from '@/stores';
import { MailActionEventDetail } from '@/lib/events/mailActionEvents';

export function handleMoveAction(
  detail: MailActionEventDetail,
  targetFolder: string,
  toastTitle: string,
  toastDesc: string,
  toastType: 'success' | 'warning' = 'success'
) {
  const { selectedIds, moveEmailToFolder, bulkMoveToFolder, selectedMailId } = useMailStore.getState();
  const targetId = detail.targetEmailId || (selectedIds.length === 0 ? selectedMailId : null);

  if (targetId) {
    moveEmailToFolder(targetId, targetFolder);
  } else if (selectedIds.length > 0) {
    bulkMoveToFolder(targetFolder);
  }
  useToastStore.getState().addToast({ title: toastTitle, description: toastDesc, type: toastType });
}

export function handleDeleteAction(detail: MailActionEventDetail) {
  const { selectedIds, deleteEmail, bulkDelete, selectedMailId } = useMailStore.getState();
  const targetId = detail.targetEmailId || (selectedIds.length === 0 ? selectedMailId : null);

  if (targetId) {
    deleteEmail(targetId);
    useToastStore.getState().addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
  } else if (selectedIds.length > 0) {
    const count = selectedIds.length;
    bulkDelete();
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

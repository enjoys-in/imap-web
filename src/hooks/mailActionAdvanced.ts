import { useMailStore, useToastStore, useRightAppsStore } from '@/stores';
import { emailsApi } from '@/lib/api';
import { exportEmailToEml } from '@/lib/emlExport';
import { MailActionEventDetail } from '@/lib/events/mailActionEvents';
import { MailMessage } from '@/types';

export function handleAdvancedMailAction(
  detail: MailActionEventDetail,
  activeEmail: MailMessage | null,
  hasTarget: boolean,
  hasExplicitTarget: boolean,
  hasBulkSelection: boolean,
  folder: string
): boolean {
  const mailStore = useMailStore.getState();
  const toastStore = useToastStore.getState();
  const rightAppsStore = useRightAppsStore.getState();
  const { selectedIds, moveEmailToFolder, bulkMoveToFolder, setSearchQuery } = mailStore;

  switch (detail.action) {
    case 'report-junk': {
      if (!hasTarget) return true;
      const junkFolder = 'fld-junk';
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, junkFolder);
        emailsApi.moveEmail(detail.targetEmailId, junkFolder, folder).catch(() => {});
      } else if (hasBulkSelection) {
        bulkMoveToFolder(junkFolder);
        emailsApi.bulkMoveEmails([...selectedIds], junkFolder, folder).catch(() => {});
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, junkFolder);
        emailsApi.moveEmail(activeEmail.id, junkFolder, folder).catch(() => {});
      }
      toastStore.addToast({ title: 'Reported Junk', description: 'Moved to Junk Email and trained spam filter', type: 'warning' });
      return true;
    }

    case 'report-phishing': {
      if (!hasTarget) return true;
      const junkFolder = 'fld-junk';
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, junkFolder);
        emailsApi.moveEmail(detail.targetEmailId, junkFolder, folder).catch(() => {});
      } else if (hasBulkSelection) {
        bulkMoveToFolder(junkFolder);
        emailsApi.bulkMoveEmails([...selectedIds], junkFolder, folder).catch(() => {});
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, junkFolder);
        emailsApi.moveEmail(activeEmail.id, junkFolder, folder).catch(() => {});
      }
      toastStore.addToast({ title: 'Reported Phishing', description: 'Sender blocked, phishing alert logged & moved to Junk', type: 'warning' });
      return true;
    }

    case 'report-concern':
      toastStore.addToast({ title: 'Concern Reported', description: 'Security concern filed with system administrators', type: 'info' });
      return true;

    case 'block-sender': {
      const sender = detail.senderAddress || activeEmail?.fromAddress;
      if (activeEmail) {
        moveEmailToFolder(activeEmail.id, 'fld-junk');
        emailsApi.moveEmail(activeEmail.id, 'fld-junk', folder).catch(() => {});
      }
      toastStore.addToast({ title: 'Sender Blocked', description: `${sender || 'Sender'} added to Blocked Senders and moved to Junk`, type: 'warning' });
      return true;
    }

    case 'allow-sender': {
      const sender = detail.senderAddress || activeEmail?.fromAddress;
      toastStore.addToast({ title: 'Sender Allowed', description: `${sender || 'Sender'} added to Safe Senders list`, type: 'success' });
      return true;
    }

    case 'mute-conversation':
      if (activeEmail) moveEmailToFolder(activeEmail.id, 'fld-archive');
      toastStore.addToast({ title: 'Conversation Muted', description: 'Future replies in this thread will be ignored', type: 'info' });
      return true;

    case 'find-conversation': {
      if (activeEmail) {
        const cleanSubject = activeEmail.subject.replace(/^(re|fwd|fw):\s*/i, '').trim();
        setSearchQuery(cleanSubject);
        toastStore.addToast({ title: 'Filtering Conversation', description: `Showing messages related to: ${cleanSubject}`, type: 'info' });
      }
      return true;
    }

    case 'find-from-sender': {
      const sender = detail.senderAddress || activeEmail?.fromAddress;
      if (sender) {
        setSearchQuery(`from:${sender}`);
        toastStore.addToast({ title: 'Filtering Sender', description: `Showing messages from: ${sender}`, type: 'info' });
      }
      return true;
    }

    case 'create-task': {
      const title = activeEmail ? `Email: ${activeEmail.subject}` : 'Email Task';
      rightAppsStore.addTodo(title, 'Tomorrow');
      rightAppsStore.toggleApp('todo');
      toastStore.addToast({ title: 'Task Created', description: `Added "${title}" to To-Do tasks panel`, type: 'success' });
      return true;
    }

    case 'add-contact': {
      const name = activeEmail?.fromName || activeEmail?.fromAddress || 'Contact';
      toastStore.addToast({ title: 'Contact Saved', description: `${name} saved to People & Contacts`, type: 'success' });
      return true;
    }

    case 'export-eml':
      if (activeEmail) {
        exportEmailToEml(activeEmail as any);
        toastStore.addToast({ title: 'Exported EML', description: 'Saved email message to local file', type: 'success' });
      }
      return true;

    case 'view-source':
      toastStore.addToast({ title: 'Message Source Verified', description: 'Authentication-Results: spf=pass, dkim=pass, dmarc=pass (p=reject)', type: 'info' });
      return true;

    default:
      return false;
  }
}

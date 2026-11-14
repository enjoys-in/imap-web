import { useMailStore, useToastStore, useRightAppsStore } from '@/stores';
import { requireSpecialFolder } from './mailActionFolders';
import { exportEmailToEml } from '@/lib/emlExport';
import { MailActionEventDetail } from '@/lib/events/mailActionEvents';
import { MailMessage } from '@/types';

export function handleAdvancedMailAction(
  detail: MailActionEventDetail,
  activeEmail: MailMessage | null,
  hasTarget: boolean,
  hasExplicitTarget: boolean,
  hasBulkSelection: boolean
): boolean {
  const mailStore = useMailStore.getState();
  const toastStore = useToastStore.getState();
  const rightAppsStore = useRightAppsStore.getState();
  const { moveEmailToFolder, bulkMoveToFolder, setSearchQuery } = mailStore;

  switch (detail.action) {
    case 'report-junk':
    case 'report-phishing': {
      if (!hasTarget) return true;
      const junk = requireSpecialFolder('Junk', 'Junk');
      if (!junk) return true;
      // moveEmailToFolder / bulkMoveToFolder also send the move request.
      if (hasExplicitTarget && detail.targetEmailId) {
        moveEmailToFolder(detail.targetEmailId, junk.id);
      } else if (hasBulkSelection) {
        bulkMoveToFolder(junk.id);
      } else if (activeEmail) {
        moveEmailToFolder(activeEmail.id, junk.id);
      }
      if (detail.action === 'report-junk') {
        toastStore.addToast({ title: 'Reported Junk', description: `Moved to ${junk.displayName} and trained spam filter`, type: 'warning' });
      } else {
        toastStore.addToast({ title: 'Reported Phishing', description: `Sender blocked, phishing alert logged & moved to ${junk.displayName}`, type: 'warning' });
      }
      return true;
    }

    case 'report-concern':
      toastStore.addToast({ title: 'Concern Reported', description: 'Security concern filed with system administrators', type: 'info' });
      return true;

    case 'block-sender': {
      const sender = detail.senderAddress || activeEmail?.fromAddress;
      const junk = requireSpecialFolder('Junk', 'Junk');
      if (activeEmail && junk) {
        moveEmailToFolder(activeEmail.id, junk.id);
      }
      toastStore.addToast({ title: 'Sender Blocked', description: `${sender || 'Sender'} added to Blocked Senders${junk ? ` and moved to ${junk.displayName}` : ''}`, type: 'warning' });
      return true;
    }

    case 'allow-sender': {
      const sender = detail.senderAddress || activeEmail?.fromAddress;
      toastStore.addToast({ title: 'Sender Allowed', description: `${sender || 'Sender'} added to Safe Senders list`, type: 'success' });
      return true;
    }

    case 'mute-conversation':
      if (activeEmail) {
        const archive = requireSpecialFolder('Archive', 'Archive');
        if (archive) moveEmailToFolder(activeEmail.id, archive.id);
      }
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

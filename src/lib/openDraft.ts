import { emailsApi } from '@/lib/api';
import { downloadMessageAttachments } from '@/lib/attachmentFiles';
import { resolveDraftBody } from '@/lib/draftUtils';
import { useComposeStore } from '@/stores/useComposeStore';
import { useToastStore } from '@/stores/useToastStore';
import type { MailMessage, MailMessageMetadata } from '@/types';

async function loadDraftBody(message: MailMessageMetadata | MailMessage): Promise<string> {
  const inline = 'bodyText' in message || 'bodyHtml' in message ? resolveDraftBody(message) : '';
  if (inline) return inline;
  return resolveDraftBody(await emailsApi.getEmailBody(message.id, message.folderId));
}

export async function openDraftForEditing(
  message: MailMessageMetadata | MailMessage
): Promise<boolean> {
  try {
    const [body, attachments] = await Promise.all([
      loadDraftBody(message),
      downloadMessageAttachments(message),
    ]);
    useComposeStore.getState().openDraft(message, body, attachments);
    return true;
  } catch {
    useToastStore.getState().addToast({
      title: 'Could not open draft',
      description:
        'The draft body or its attachments could not be loaded. It was left unchanged so nothing is lost.',
      type: 'error',
    });
    return false;
  }
}

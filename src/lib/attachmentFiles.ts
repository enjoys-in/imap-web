import { emailsApi } from '@/lib/api';
import type { MailMessage, MailMessageMetadata, OutgoingAttachment } from '@/types';

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function toOutgoingAttachments(files: readonly File[]): Promise<OutgoingAttachment[]> {
  return Promise.all(
    files.map(async (file): Promise<OutgoingAttachment> => ({
      filename: file.name,
      content: await fileToBase64(file),
      encoding: 'base64',
      contentType: file.type || DEFAULT_CONTENT_TYPE,
    }))
  );
}

export function downloadMessageAttachments(
  message: MailMessageMetadata | MailMessage
): Promise<File[]> {
  const uid = message.uid || message.id;
  const attachments = (message.attachments ?? []).filter((attachment) => !attachment.isInline);
  return Promise.all(
    attachments.map(async (attachment) => {
      const blob = await emailsApi.downloadAttachment(
        message.folderId,
        uid,
        attachment.part || attachment.id
      );
      return new File([blob], attachment.fileName, {
        type: attachment.contentType || blob.type || DEFAULT_CONTENT_TYPE,
      });
    })
  );
}

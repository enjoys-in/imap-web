'use client';

import { useCallback } from 'react';
import { useComposeStore } from '@/stores/useComposeStore';
import { useToastStore } from '@/stores/useToastStore';
import {
  MAX_ATTACHMENT_TOTAL_BYTES,
  partitionByAttachmentLimit,
  totalAttachmentBytes,
} from '@/lib/attachmentLimits';
import { formatFileSize } from '@/lib/utils';

export function useAttachFiles(): (files: readonly File[]) => File[] {
  const addAttachment = useComposeStore((s) => s.addAttachment);
  const addToast = useToastStore((s) => s.addToast);

  return useCallback(
    (files) => {
      const current = useComposeStore.getState().attachments;
      const { accepted, rejected } = partitionByAttachmentLimit(current, files);
      accepted.forEach(addAttachment);

      if (rejected.length > 0) {
        const subject =
          rejected.length === 1
            ? `"${rejected[0].name}" (${formatFileSize(rejected[0].size)})`
            : `${rejected.length} files`;
        const attached = formatFileSize(totalAttachmentBytes([...current, ...accepted]));
        addToast({
          title: 'Attachment limit reached',
          description: `${subject} not attached. Attachments can total up to ${formatFileSize(MAX_ATTACHMENT_TOTAL_BYTES)} per message and you already have ${attached}.`,
          type: 'warning',
        });
      }

      return accepted;
    },
    [addAttachment, addToast]
  );
}

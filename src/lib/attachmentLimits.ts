export const MAX_ATTACHMENT_TOTAL_BYTES = 20 * 1024 * 1024;
export const ATTACHMENT_WARNING_RATIO = 0.8;

export interface AttachmentPartition {
  accepted: File[];
  rejected: File[];
}

export function totalAttachmentBytes(files: readonly File[]): number {
  return files.reduce((sum, file) => sum + file.size, 0);
}

export function isNearAttachmentLimit(files: readonly File[]): boolean {
  return totalAttachmentBytes(files) >= MAX_ATTACHMENT_TOTAL_BYTES * ATTACHMENT_WARNING_RATIO;
}

export function partitionByAttachmentLimit(
  existing: readonly File[],
  incoming: readonly File[]
): AttachmentPartition {
  let total = totalAttachmentBytes(existing);
  const accepted: File[] = [];
  const rejected: File[] = [];
  for (const file of incoming) {
    if (total + file.size <= MAX_ATTACHMENT_TOTAL_BYTES) {
      accepted.push(file);
      total += file.size;
    } else {
      rejected.push(file);
    }
  }
  return { accepted, rejected };
}

export const messageKey = (folderId: string, id: string): string => `${folderId}|${id}`;

export const isServerMessageId = (id: string): boolean => /^(msg-)?\d+$/.test(id);

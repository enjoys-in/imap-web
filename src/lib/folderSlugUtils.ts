/**
 * Helper utilities for mapping between internal folder IDs (e.g. 'fld-inbox')
 * and human-readable URL slugs (e.g. 'inbox') matching web mail conventions.
 */

export function folderIdToSlug(folderId?: string | null): string {
  if (!folderId) return 'inbox';
  switch (folderId) {
    case 'fld-inbox':
      return 'inbox';
    case 'fld-sent':
      return 'sent';
    case 'fld-drafts':
      return 'drafts';
    case 'fld-archive':
      return 'archive';
    case 'fld-junk':
      return 'junk';
    case 'fld-trash':
      return 'trash';
    case 'fld-notes':
      return 'notes';
    default:
      if (folderId.startsWith('fld-')) {
        return folderId.replace(/^fld-/, '');
      }
      return folderId;
  }
}

export function slugToFolderId(slug?: string | null): string {
  if (!slug) return 'fld-inbox';
  const s = slug.toLowerCase().trim();
  switch (s) {
    case 'inbox':
      return 'fld-inbox';
    case 'sent':
    case 'sent items':
      return 'fld-sent';
    case 'drafts':
      return 'fld-drafts';
    case 'archive':
      return 'fld-archive';
    case 'junk':
    case 'junk email':
      return 'fld-junk';
    case 'trash':
    case 'deleted':
    case 'deleted items':
      return 'fld-trash';
    case 'notes':
      return 'fld-notes';
    default:
      if (s.startsWith('fld-')) return s;
      return `fld-${s}`;
  }
}

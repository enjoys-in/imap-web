import React from 'react';
import { NotesPageView } from '@/components/notes/NotesPageView';

export const metadata = {
  title: 'Notes — AirSend',
  description: 'Quick capture sticky notes, meeting memos, and color-tagged scratchpads.',
};

export default function NotesPage() {
  return <NotesPageView />;
}

import React from 'react';
import { FilesPageView } from '@/components/files/FilesPageView';

export const metadata = {
  title: 'Cloud Storage & Files — AirSend',
  description: 'Manage email attachments, shared documents, and cloud storage archives.',
};

export default function FilesPage() {
  return <FilesPageView />;
}

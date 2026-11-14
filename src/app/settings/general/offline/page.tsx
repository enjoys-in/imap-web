import React from 'react';
import { OfflineSettingsView } from '@/components/settings/subviews/OfflineSettingsView';

export const metadata = {
  title: 'Offline Settings — AirSend',
  description: 'Manage offline access, folder synchronization, and days of email to save.',
};

export default function OfflineSettingsPage() {
  return <OfflineSettingsView />;
}

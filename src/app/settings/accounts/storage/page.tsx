import React from 'react';
import { StorageSettingsView } from '@/components/settings/subviews/StorageSettingsView';

export const metadata = {
  title: 'Storage & Quota — AirSend Settings',
};

export default function StoragePage() {
  return <StorageSettingsView />;
}

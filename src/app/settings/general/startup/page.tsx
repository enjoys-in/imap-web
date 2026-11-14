import React from 'react';
import { StartupSettingsView } from '@/components/settings/subviews/StartupSettingsView';

export const metadata = {
  title: 'Start up — AirSend Settings',
  description: 'Choose what folder and windows open on startup.',
};

export default function StartupSettingsPage() {
  return <StartupSettingsView />;
}

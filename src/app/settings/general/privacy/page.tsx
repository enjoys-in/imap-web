import React from 'react';
import { PrivacySettingsView } from '@/components/settings/subviews/PrivacySettingsView';

export const metadata = {
  title: 'Privacy and data — AirSend Settings',
  description: 'Manage diagnostic telemetry, connected experiences, and data exports.',
};

export default function PrivacySettingsPage() {
  return <PrivacySettingsView />;
}

import React from 'react';
import { AccountGeneralSettingsView } from '@/components/settings/subviews/AccountGeneralSettingsView';

export const metadata = {
  title: 'General & Server Settings — AirSend',
  description: 'Configure incoming IMAP and outgoing SMTP server parameters, sync intervals, and credentials.',
};

export default function AccountGeneralSettingsPage() {
  return <AccountGeneralSettingsView />;
}

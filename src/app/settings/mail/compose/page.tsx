import React from 'react';
import { MailSettingsView } from '@/components/settings/MailSettingsView';

export const metadata = {
  title: 'Compose & Message Handling — AirSend Settings',
  description: 'Configure default message composition, reply settings, and send preferences.',
};

export default function MailComposePage() {
  return <MailSettingsView />;
}

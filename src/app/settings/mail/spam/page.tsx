import React from 'react';
import { JunkSettingsView } from '@/components/settings/subviews/JunkSettingsView';

export const metadata = {
  title: 'Spam Filter & Junk Email — AirSend Settings',
};

export default function SpamPage() {
  return <JunkSettingsView />;
}

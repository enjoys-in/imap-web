import React from 'react';
import { AppearanceSettingsView } from '@/components/settings/subviews/AppearanceSettingsView';

export const metadata = {
  title: 'Appearance & Themes — AirSend Settings',
  description: 'Customize the application theme.',
};

export default function GeneralAppearancePage() {
  return <AppearanceSettingsView />;
}

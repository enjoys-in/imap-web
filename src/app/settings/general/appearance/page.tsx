import React from 'react';
import { GeneralSettingsView } from '@/components/settings/GeneralSettingsView';

export const metadata = {
  title: 'Appearance & Themes — AirSend Settings',
  description: 'Customize application theme, colors, and layout appearance.',
};

export default function GeneralAppearancePage() {
  return <GeneralSettingsView />;
}

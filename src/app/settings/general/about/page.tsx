import React from 'react';
import { AboutSettingsView } from '@/components/settings/subviews/AboutSettingsView';

export const metadata = {
  title: 'About AirSend — General Settings',
  description: 'Application build version, architecture, and diagnostics.',
};

export default function AboutSettingsPage() {
  return <AboutSettingsView />;
}

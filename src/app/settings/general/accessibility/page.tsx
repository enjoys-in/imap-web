import React from 'react';
import { AccessibilitySettingsView } from '@/components/settings/subviews/AccessibilitySettingsView';

export const metadata = {
  title: 'Accessibility — AirSend Settings',
  description: 'Configure high contrast, reduced motion, and keyboard navigation.',
};

export default function AccessibilitySettingsPage() {
  return <AccessibilitySettingsView />;
}

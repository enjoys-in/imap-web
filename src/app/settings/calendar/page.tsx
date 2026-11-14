import React from 'react';
import { CalendarSettingsView } from '@/components/settings/subviews/CalendarSettingsView';

export const metadata = {
  title: 'Calendars — AirSend Settings',
  description: 'Create and manage your calendars.',
};

export default function CalendarSettingsPage() {
  return <CalendarSettingsView />;
}

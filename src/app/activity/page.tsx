import React from 'react';
import { ActivityPageView } from '@/components/activity/ActivityPageView';

export const metadata = {
  title: 'Activity Feed & Updates — AirSend',
  description: 'Timeline of mentions, calendar invites, shared documents, and email notifications.',
};

export default function ActivityPage() {
  return <ActivityPageView />;
}

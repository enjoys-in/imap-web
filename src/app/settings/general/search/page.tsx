import React from 'react';
import { SearchSettingsView } from '@/components/settings/subviews/SearchSettingsView';

export const metadata = {
  title: 'Search Settings — AirSend',
  description: 'Configure default search scope and query history preferences.',
};

export default function SearchSettingsPage() {
  return <SearchSettingsView />;
}

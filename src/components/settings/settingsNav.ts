import { Calendar, Mail, Settings, Users, type LucideIcon } from 'lucide-react';

export interface SettingsSubcategory {
  id: string;
  label: string;
  href: string;
}

export interface SettingsCategory {
  id: string;
  label: string;
  basePath: string;
  href: string;
  icon: LucideIcon;
  subcategories: SettingsSubcategory[];
}

export const SETTINGS_CATEGORIES: readonly SettingsCategory[] = [
  {
    id: 'accounts',
    label: 'Accounts',
    basePath: '/settings/accounts',
    href: '/settings/accounts',
    icon: Users,
    subcategories: [
      { id: 'your-accounts', label: 'Your accounts', href: '/settings/accounts' },
      { id: 'general', label: 'General & server', href: '/settings/accounts/general' },
      { id: 'signatures', label: 'Signatures', href: '/settings/accounts/signatures' },
      { id: 'auto-replies', label: 'Automatic replies', href: '/settings/accounts/auto-replies' },
      { id: 'categories', label: 'Categories', href: '/settings/accounts/categories' },
      { id: 'storage', label: 'Storage', href: '/settings/accounts/storage' },
    ],
  },
  {
    id: 'general',
    label: 'General',
    basePath: '/settings/general',
    href: '/settings/general/language',
    icon: Settings,
    subcategories: [
      { id: 'language', label: 'Language and time', href: '/settings/general/language' },
      { id: 'appearance', label: 'Appearance', href: '/settings/general/appearance' },
      { id: 'notifications', label: 'Notifications', href: '/settings/general/notifications' },
      { id: 'accessibility', label: 'Accessibility', href: '/settings/general/accessibility' },
      { id: 'privacy', label: 'Privacy and data', href: '/settings/general/privacy' },
      { id: 'search', label: 'Search', href: '/settings/general/search' },
      { id: 'offline', label: 'Offline', href: '/settings/general/offline' },
      { id: 'startup', label: 'Start up', href: '/settings/general/startup' },
      { id: 'about', label: 'About AirSend', href: '/settings/general/about' },
    ],
  },
  {
    id: 'mail',
    label: 'Mail',
    basePath: '/settings/mail',
    href: '/settings/mail/compose',
    icon: Mail,
    subcategories: [
      { id: 'compose', label: 'Compose and reply', href: '/settings/mail/compose' },
      { id: 'customize-actions', label: 'Customize actions', href: '/settings/mail/customize-actions' },
      { id: 'rules', label: 'Rules & filters', href: '/settings/mail/rules' },
      { id: 'junk', label: 'Spam & Junk filter', href: '/settings/mail/junk' },
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    basePath: '/settings/calendar',
    href: '/settings/calendar',
    icon: Calendar,
    subcategories: [{ id: 'calendars', label: 'Calendars', href: '/settings/calendar' }],
  },
];

export function findActiveCategory(pathname: string): SettingsCategory {
  return (
    SETTINGS_CATEGORIES.find(
      (category) =>
        pathname === category.basePath || pathname.startsWith(`${category.basePath}/`)
    ) ?? SETTINGS_CATEGORIES[0]
  );
}

export const isActiveSubcategory = (pathname: string, subcategory: SettingsSubcategory): boolean =>
  pathname === subcategory.href;

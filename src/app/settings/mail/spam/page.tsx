import { redirect } from 'next/navigation';

export default function SpamSettingsRedirectPage() {
  redirect('/settings/mail/junk');
}

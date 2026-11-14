import { redirect } from 'next/navigation';

export default function MailSettingsIndexPage() {
  redirect('/settings/mail/compose');
}

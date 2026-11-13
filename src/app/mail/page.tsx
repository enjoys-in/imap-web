import { redirect } from 'next/navigation';
import { folderIdToSlug } from '@/lib/folderSlugUtils';

interface MailPageProps {
  searchParams: Promise<{ folder?: string; id?: string }>;
}

// Redirects legacy or unparameterized /mail visits to /mail/u/0/#inbox
export default async function MailPage({ searchParams }: MailPageProps) {
  const resolved = await searchParams;

  if (resolved.id) {
    const slug = folderIdToSlug(resolved.folder);
    redirect(`/mail/u/0/#${slug}/${resolved.id}`);
  }

  if (resolved.folder) {
    const slug = folderIdToSlug(resolved.folder);
    redirect(`/mail/u/0/#${slug}`);
  }

  redirect('/mail/u/0');
}

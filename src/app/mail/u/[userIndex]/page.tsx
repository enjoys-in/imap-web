import React, { Suspense } from 'react';
import { MailClientView } from '@/components/mail/MailClientView';
import { OutlookAppSkeleton } from '@/components/layout/OutlookAppSkeleton';

interface MailUserPageProps {
  params: Promise<{ userIndex: string }>;
}

// React Server Component handling multi-account routes (/mail/u/0, /mail/u/1, etc.)
export default async function MailUserPage({ params }: MailUserPageProps) {
  const { userIndex } = await params;

  return (
    <Suspense fallback={<OutlookAppSkeleton />}>
      <MailClientView userIndex={userIndex} />
    </Suspense>
  );
}

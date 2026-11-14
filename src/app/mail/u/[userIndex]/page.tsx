import React, { Suspense } from 'react';
import { MailClientView } from '@/components/mail/MailClientView';
import { OutlookAppSkeleton } from '@/components/layout/OutlookAppSkeleton';

interface MailUserPageProps {
  params: Promise<{ userIndex: string }>;
}

async function MailUserContent({
  params,
}: {
  params: Promise<{ userIndex: string }>;
}) {
  const { userIndex } = await params;
  return <MailClientView userIndex={userIndex} />;
}

// React Server Component handling multi-account routes (/mail/u/0, /mail/u/1, etc.)
export default function MailUserPage({ params }: MailUserPageProps) {
  return (
    <Suspense fallback={<OutlookAppSkeleton />}>
      <MailUserContent params={params} />
    </Suspense>
  );
}

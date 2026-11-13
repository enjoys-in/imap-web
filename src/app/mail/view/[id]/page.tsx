import React, { Suspense } from 'react';
import { ThreadConversationView, ReadingPaneSkeleton } from '@/components/mail/reading-pane';

interface MailViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function MailViewPage({ params }: MailViewPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ReadingPaneSkeleton />}>
      <ThreadConversationView mailId={id} />
    </Suspense>
  );
}

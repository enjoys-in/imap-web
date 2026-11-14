import React, { Suspense } from 'react';
import {
  ThreadConversationView,
  ReadingPaneSkeleton,
} from '@/components/mail/reading-pane';

interface MailViewPageProps {
  params: Promise<{ id: string }>;
}

async function MailViewContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ThreadConversationView mailId={id} />;
}

export default function MailViewPage({ params }: MailViewPageProps) {
  return (
    <Suspense fallback={<ReadingPaneSkeleton />}>
      <MailViewContent params={params} />
    </Suspense>
  );
}

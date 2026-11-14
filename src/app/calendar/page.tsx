import React, { Suspense } from 'react';
import { CalendarView } from '@/components/calendar/CalendarView';

export const instant = false;

// React Server Component for /calendar
export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarView />
    </Suspense>
  );
}

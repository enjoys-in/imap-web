import { OutlookAppSkeleton } from '@/components/layout/OutlookAppSkeleton';

// Subtle route navigation skeleton so splash screen does NOT fire on route changes
export default function Loading() {
  return <OutlookAppSkeleton />;
}

import { format, isToday, isThisYear } from 'date-fns';

export function formatDisplayDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isThisYear(d)) return format(d, 'EEE h:mm a');
    return format(d, 'M/d');
  } catch {
    return '';
  }
}

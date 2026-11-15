import { CalendarColor } from '../types';

export const HOURS = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM',
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

export const BUSY_OPTIONS = [
  { id: 'Free', label: 'Free' },
  { id: 'WorkingElsewhere', label: 'Working elsewhere' },
  { id: 'Tentative', label: 'Tentative' },
  { id: 'Busy', label: 'Busy' },
  { id: 'Away', label: 'Away' },
];

export const REMINDER_OPTIONS = [
  { id: 'none', label: "Don't remind me" },
  { id: '0m', label: '0 minutes before' },
  { id: '5m', label: '5 minutes before' },
  { id: '15m', label: '15 minutes before' },
  { id: '30m', label: '30 minutes before' },
  { id: '1h', label: '1 hour before' },
  { id: '1d', label: '1 day before' },
];

export const CATEGORY_COLORS: { id: CalendarColor; label: string; bg: string }[] = [
  { id: 'salmon', label: 'Red category', bg: '#d13438' },
  { id: 'peach', label: 'Orange category', bg: '#da3b01' },
  { id: 'yellow', label: 'Yellow category', bg: '#fce100' },
  { id: 'green', label: 'Green category', bg: '#107c41' },
  { id: 'blue', label: 'Blue category', bg: '#0078d4' },
  { id: 'purple', label: 'Purple category', bg: '#5c2d91' },
];

export const SENSITIVITY_OPTIONS = [
  { id: 'Normal', label: 'Normal' },
  { id: 'Personal', label: 'Personal' },
  { id: 'Private', label: 'Private' },
  { id: 'Confidential', label: 'Confidential' },
];

export const CHARMS = ['❤️', '⭐', '🎂', '☕', '💡', '🎉', '✈️', '💼', '📌', '🏋️', '📚', '🎯'];

export function formatTimeDisplay(hourDecimal: number): string {
  const normalizedHour = (hourDecimal % 24 + 24) % 24;
  const hours = Math.floor(normalizedHour);
  const minutes = Math.round((normalizedHour - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHour}:${displayMinutes} ${ampm}`;
}

export function format24hTime(hourDecimal: number): string {
  const normalizedHour = (hourDecimal % 24 + 24) % 24;
  const hours = Math.floor(normalizedHour);
  const minutes = Math.round((normalizedHour - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const h2Digit = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
  return `${h2Digit}:${displayMinutes} ${ampm}`;
}

// 96 discrete 15-minute time intervals across 24 hours (:00, :15, :30, :45)
export const TIME_INTERVALS_15M = Array.from({ length: 96 }, (_, idx) => {
  const val = idx * 0.25;
  return { value: val, label: format24hTime(val) };
});

export const DURATION_OPTIONS = [
  { value: 0.25, label: '15 minutes' },
  { value: 0.5, label: '30 minutes' },
  { value: 0.75, label: '45 minutes' },
  { value: 1.0, label: '1 hour' },
  { value: 1.5, label: '1.5 hours' },
  { value: 2.0, label: '2 hours' },
  { value: 3.0, label: '3 hours' },
];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatOutlookEventDate(
  date: Date,
  startHourDecimal: number,
  durationHours: number,
  isAllDay = false
): string {
  const dayName = DAYS_SHORT[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  if (isAllDay) {
    return `${dayName} ${dd}-${mm}-${yyyy} (All day)`;
  }

  const startTime = format24hTime(startHourDecimal);
  const endTime = format24hTime(startHourDecimal + durationHours);
  return `${dayName} ${dd}-${mm}-${yyyy} ${startTime} - ${endTime}`;
}

export function formatSchedulerHeaderDate(date: Date): string {
  const dayName = DAYS_SHORT[date.getDay()];
  const dd = date.getDate();
  const monthName = MONTHS_SHORT[date.getMonth()];
  const yyyy = date.getFullYear();
  return `${dayName}, ${dd} ${monthName}, ${yyyy}`;
}

export function formatEventBlockDisplay(startHourDecimal: number, durationHours: number): string {
  const startStr = formatTimeDisplay(startHourDecimal);
  const endStr = formatTimeDisplay(startHourDecimal + durationHours);
  return `${startStr} - ${endStr}`;
}


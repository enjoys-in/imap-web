export type ShowAs = 'Busy' | 'Tentative' | 'Free' | 'OutOfOffice';

export type MeetingResponse =
  | 'None'
  | 'NeedsAction'
  | 'Accepted'
  | 'Tentative'
  | 'Declined';

export type RepeatFrequency =
  | 'Never'
  | 'Daily'
  | 'Weekdays'
  | 'Weekly'
  | 'Monthly'
  | 'Yearly';

export interface Appointment {
  id: string;
  accountId: string;
  uid: string;
  sequence: number;
  title: string;
  location?: string;
  startUtc: string;
  endUtc: string;
  isAllDay: boolean;
  isRecurring: boolean;
  seriesEndUtc?: string | null;
  organizerEmail: string;
  organizerName: string;
  isOrganizer: boolean;
  attendees: string;
  myResponse: MeetingResponse;
  showAs: ShowAs;
  reminderMinutes?: number;
  notes?: string;
}

export interface AppointmentDraft {
  title: string;
  location: string;
  start: string;
  end: string;
  isAllDay: boolean;
  repeat: RepeatFrequency;
  repeatUntil?: string | null;
  reminderMinutes?: number;
  showAs: ShowAs;
  attendees: string;
  notes: string;
}

export type CalendarColor =
  | 'peach'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'salmon';

export interface CalendarParticipant {
  id: string;
  name: string;
  avatar: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  dayIndex: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "11:00 AM"
  startHour: number; // 9
  durationHours: number; // 2
  color: CalendarColor;
  striped?: boolean;
  category?: string;
  description?: string;
  meetUrl?: string;
  participants: CalendarParticipant[];
  extraAttendeesCount?: number;
  isDraft?: boolean;
  uid?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  isException?: boolean;
  originalStart?: string;
  organizerEmail?: string;
  isOrganizer?: boolean;
  myResponse?: 'None' | 'NeedsAction' | 'Accepted' | 'Tentative' | 'Declined';
}

export interface WorkspaceTab {
  id: string;
  name: string;
  icon?: string;
  active: boolean;
}

export type CalendarViewMode = 'Day' | 'Week' | 'Month';

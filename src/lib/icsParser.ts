/**
 * Lightweight RFC 5545 iCalendar (.ics) parser for email invitations & RSVP.
 */

export interface IcsAttendee {
  name: string;
  email: string;
  role?: string;
  partstat?: 'NEEDS-ACTION' | 'ACCEPTED' | 'TENTATIVE' | 'DECLINED' | string;
}

export interface ParsedIcsInvite {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  meetingUrl?: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  organizer: {
    name: string;
    email: string;
  };
  attendees: IcsAttendee[];
  method: 'REQUEST' | 'REPLY' | 'CANCEL' | 'PUBLISH' | string;
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED' | string;
  sequence: number;
  recurrenceRule?: string;
  rawIcs: string;
}

/**
 * Checks if raw text or email content contains an iCalendar block
 */
export function containsIcsCalendar(text?: string | null): boolean {
  if (!text) return false;
  return text.includes('BEGIN:VCALENDAR') && text.includes('BEGIN:VEVENT');
}

/**
 * Extracts meeting URL (Teams, Zoom, Google Meet, Webex) from text or location
 */
export function extractMeetingLink(text?: string): string | undefined {
  if (!text) return undefined;
  const match = text.match(
    /https?:\/\/(?:teams\.microsoft\.com\/l\/meetup-join|teams\.live\.com\/meet|meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}|[\w-]+\.zoom\.us\/j\/[0-9]+|[\w-]+\.zoom\.us\/my\/[a-zA-Z0-9._]+|[\w-]+\.webex\.com\/[\w-]+)\b[^\s<>"')]+/i
  ) || text.match(/^https?:\/\/[^\s<>"')]+/i);
  return match ? match[0] : undefined;
}

/**
 * Parses RFC 5545 Date/DateTime strings
 */
function parseIcsDateTime(val: string): { date: Date; isAllDay: boolean } {
  if (!val) return { date: new Date(), isAllDay: false };

  // Remove potential TZID parameter values if present in raw string
  const cleanVal = val.includes(':') ? val.split(':').pop()! : val;
  const digits = cleanVal.replace(/[^0-9TZ]/g, '');

  if (digits.length === 8) {
    // All-day event: YYYYMMDD
    const y = parseInt(digits.slice(0, 4), 10);
    const m = parseInt(digits.slice(4, 6), 10) - 1;
    const d = parseInt(digits.slice(6, 8), 10);
    return { date: new Date(y, m, d), isAllDay: true };
  }

  const match = digits.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (match) {
    const [, y, mo, d, h, mi, s, z] = match;
    if (z === 'Z') {
      return {
        date: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)),
        isAllDay: false,
      };
    }
    return {
      date: new Date(+y, +mo - 1, +d, +h, +mi, +s),
      isAllDay: false,
    };
  }

  // Fallback to standard JS Date parser
  const parsed = new Date(val);
  return {
    date: isNaN(parsed.getTime()) ? new Date() : parsed,
    isAllDay: false,
  };
}

/**
 * Parses raw .ics file text into a structured ParsedIcsInvite object
 */
export function parseIcsInvite(rawText: string): ParsedIcsInvite | null {
  if (!rawText || !rawText.includes('BEGIN:VCALENDAR')) {
    return null;
  }

  // 1. Unfold lines according to RFC 5545 (CRLF followed by single space or tab)
  const unfolded = rawText.replace(/\r?\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);

  let inEvent = false;
  let uid = '';
  let summary = '';
  let description = '';
  let location = '';
  let dtstartStr = '';
  let dtendStr = '';
  let organizer = { name: '', email: '' };
  const attendees: IcsAttendee[] = [];
  let status = 'CONFIRMED';
  let method = 'REQUEST';
  let sequence = 0;
  let recurrenceRule = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('METHOD:')) {
      method = line.slice(7).trim().toUpperCase();
      continue;
    }

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      continue;
    }

    if (line === 'END:VEVENT') {
      inEvent = false;
      continue;
    }

    if (!inEvent) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const propHeader = line.slice(0, colonIdx);
    const rawVal = line.slice(colonIdx + 1);
    const [propName, ...params] = propHeader.split(';');
    const cleanVal = rawVal
      .replace(/\\n/gi, '\n')
      .replace(/\\([,;\\])/g, '$1')
      .trim();

    switch (propName.toUpperCase()) {
      case 'UID':
        uid = cleanVal;
        break;
      case 'SUMMARY':
        summary = cleanVal;
        break;
      case 'DESCRIPTION':
        description = cleanVal;
        break;
      case 'LOCATION':
        location = cleanVal;
        break;
      case 'DTSTART':
        dtstartStr = rawVal.trim();
        break;
      case 'DTEND':
        dtendStr = rawVal.trim();
        break;
      case 'STATUS':
        status = cleanVal.toUpperCase();
        break;
      case 'SEQUENCE':
        sequence = parseInt(cleanVal, 10) || 0;
        break;
      case 'RRULE':
        recurrenceRule = cleanVal;
        break;
      case 'ORGANIZER': {
        let cn = '';
        for (const p of params) {
          const up = p.toUpperCase();
          if (up.startsWith('CN=')) {
            cn = p.slice(3).replace(/^"|"$/g, '');
          }
        }
        const email = cleanVal.replace(/^mailto:/i, '').trim();
        organizer = {
          name: cn || email.split('@')[0] || 'Organizer',
          email,
        };
        break;
      }
      case 'ATTENDEE': {
        let cn = '';
        let partstat = 'NEEDS-ACTION';
        let role = 'REQ-PARTICIPANT';
        for (const p of params) {
          const up = p.toUpperCase();
          if (up.startsWith('CN=')) {
            cn = p.slice(3).replace(/^"|"$/g, '');
          } else if (up.startsWith('PARTSTAT=')) {
            partstat = p.slice(9).replace(/^"|"$/g, '').toUpperCase();
          } else if (up.startsWith('ROLE=')) {
            role = p.slice(5).replace(/^"|"$/g, '').toUpperCase();
          }
        }
        const email = cleanVal.replace(/^mailto:/i, '').trim();
        attendees.push({
          name: cn || email.split('@')[0] || email,
          email,
          partstat,
          role,
        });
        break;
      }
    }
  }

  if (!uid && !summary && !dtstartStr) {
    return null;
  }

  const startInfo = parseIcsDateTime(dtstartStr);
  const endInfo = dtendStr
    ? parseIcsDateTime(dtendStr)
    : {
        date: new Date(startInfo.date.getTime() + (startInfo.isAllDay ? 86400000 : 3600000)),
        isAllDay: startInfo.isAllDay,
      };

  const meetingUrl = extractMeetingLink(location) || extractMeetingLink(description);

  return {
    uid: uid || `evt-${Date.now()}`,
    summary: summary || 'Calendar Invitation',
    description: description || undefined,
    location: location || undefined,
    meetingUrl,
    start: startInfo.date,
    end: endInfo.date,
    isAllDay: startInfo.isAllDay,
    organizer: organizer.email ? organizer : { name: 'Meeting Organizer', email: '' },
    attendees,
    method,
    status,
    sequence,
    recurrenceRule: recurrenceRule || undefined,
    rawIcs: rawText,
  };
}

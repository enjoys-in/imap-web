/**
 * CalDev RFC 5545 Recurrence & Occurrence Expander
 * Implements client-side series expansion and occurrence patching
 * as specified in CalDev UI Integration Guide (Section 6).
 */

export interface OccurrencePatch {
  start?: string;
  end?: string;
  title?: string;
  description?: string;
  location?: string;
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  excluded?: boolean;
}

export interface RawJmapEvent {
  id: string;
  uid?: string;
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end?: string;
  duration?: string;
  timeZone?: string;
  isAllDay?: boolean;
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  sequence?: number;
  priority?: number;
  classification?: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL';
  organizer?: string;
  participants?: Record<string, {
    name?: string;
    email?: string;
    kind?: string;
    participationStatus?: 'NEEDS-ACTION' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
    expectReply?: boolean;
  }>;
  recurrenceRules?: { rule: string }[];
  recurrenceOverrides?: Record<string, OccurrencePatch>;
  recurrenceId?: string;
}

export interface ExpandedOccurrence {
  eventId: string;
  uid: string;
  originalStart: string;
  start: Date;
  end: Date;
  title: string;
  description?: string;
  location?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  isException: boolean;
  status: string;
  organizerEmail?: string;
  participants?: RawJmapEvent['participants'];
}

const DAY_MAP: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

interface ParsedRRule {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  count?: number;
  until?: Date;
  byDay?: number[];
}

function parseRRule(ruleStr: string): ParsedRRule | null {
  const clean = ruleStr.replace(/^RRULE:/i, '').trim();
  const parts = clean.split(';');
  const map: Record<string, string> = {};
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k && v) map[k.toUpperCase()] = v.toUpperCase();
  }

  const freq = map['FREQ'] as ParsedRRule['freq'];
  if (!freq || !['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(freq)) {
    return null;
  }

  const interval = map['INTERVAL'] ? parseInt(map['INTERVAL'], 10) || 1 : 1;
  const count = map['COUNT'] ? parseInt(map['COUNT'], 10) : undefined;
  const until = map['UNTIL'] ? parseRRuleDate(map['UNTIL']) : undefined;

  let byDay: number[] | undefined;
  if (map['BYDAY']) {
    byDay = map['BYDAY']
      .split(',')
      .map((d) => {
        const code = d.replace(/[^A-Z]/g, '');
        return DAY_MAP[code];
      })
      .filter((n): n is number => n !== undefined);
  }

  return { freq, interval, count, until, byDay };
}

function parseRRuleDate(str: string): Date {
  // Handles 20261120T100000Z or 20261120
  const match = str.match(/^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/);
  if (!match) return new Date(str);
  const [, y, m, d, , h = '00', min = '00', s = '00'] = match;
  return new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), parseInt(h, 10), parseInt(min, 10), parseInt(s, 10)));
}

/**
 * Generates recurrence start dates between [windowFrom, windowTo].
 */
function generateSeriesStarts(
  dtStart: Date,
  rule: ParsedRRule,
  windowFrom: Date,
  windowTo: Date
): Date[] {
  const results: Date[] = [];
  let current = new Date(dtStart.getTime());
  let emittedCount = 0;
  const maxIterations = 500;
  let iterations = 0;

  // Buffer search range slightly
  const extendedTo = new Date(windowTo.getTime() + 86400000);

  while (iterations < maxIterations) {
    iterations++;

    if (rule.until && current > rule.until) break;
    if (rule.count !== undefined && emittedCount >= rule.count) break;
    if (current > extendedTo) break;

    if (rule.freq === 'DAILY') {
      if (current >= windowFrom && current <= windowTo) {
        results.push(new Date(current.getTime()));
      }
      emittedCount++;
      current.setDate(current.getDate() + rule.interval);
    } else if (rule.freq === 'WEEKLY') {
      const byDays = rule.byDay && rule.byDay.length > 0 ? rule.byDay : [dtStart.getDay()];
      // Check days in current week
      const weekStart = new Date(current.getTime());
      // Adjust to Monday of this week
      const dayOffset = (weekStart.getDay() + 6) % 7;
      weekStart.setDate(weekStart.getDate() - dayOffset);

      for (const targetDay of byDays) {
        const candidate = new Date(weekStart.getTime());
        const addDays = (targetDay + 6) % 7;
        candidate.setDate(candidate.getDate() + addDays);
        candidate.setHours(dtStart.getHours(), dtStart.getMinutes(), dtStart.getSeconds(), dtStart.getMilliseconds());

        if (candidate >= dtStart) {
          if (rule.until && candidate > rule.until) continue;
          if (rule.count !== undefined && emittedCount >= rule.count) break;
          if (candidate >= windowFrom && candidate <= windowTo) {
            results.push(new Date(candidate.getTime()));
          }
          emittedCount++;
        }
      }

      current.setDate(current.getDate() + 7 * rule.interval);
    } else if (rule.freq === 'MONTHLY') {
      if (current >= windowFrom && current <= windowTo) {
        results.push(new Date(current.getTime()));
      }
      emittedCount++;
      current.setMonth(current.getMonth() + rule.interval);
    } else if (rule.freq === 'YEARLY') {
      if (current >= windowFrom && current <= windowTo) {
        results.push(new Date(current.getTime()));
      }
      emittedCount++;
      current.setFullYear(current.getFullYear() + rule.interval);
    }
  }

  return results.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Expands JMAP calendar events and resolves occurrence patches.
 */
export function expandEventOccurrences(
  events: RawJmapEvent[],
  windowFrom: Date,
  windowTo: Date
): ExpandedOccurrence[] {
  const result: ExpandedOccurrence[] = [];

  for (const ev of events) {
    const startInstant = new Date(ev.start);
    const endInstant = ev.end ? new Date(ev.end) : new Date(startInstant.getTime() + 3600000);
    const durationMs = Math.max(0, endInstant.getTime() - startInstant.getTime());
    const ruleStr = ev.recurrenceRules?.[0]?.rule;
    const uid = ev.uid || ev.id;

    if (!ruleStr) {
      // Non-recurring event: include if it overlaps the window
      if (endInstant >= windowFrom && startInstant <= windowTo) {
        result.push({
          eventId: ev.id,
          uid,
          originalStart: ev.start,
          start: startInstant,
          end: endInstant,
          title: ev.title || 'Untitled Event',
          description: ev.description,
          location: ev.location,
          isAllDay: Boolean(ev.isAllDay),
          isRecurring: false,
          isException: false,
          status: ev.status || 'CONFIRMED',
          organizerEmail: ev.organizer,
          participants: ev.participants,
        });
      }
      continue;
    }

    // Recurring series
    const parsedRule = parseRRule(ruleStr);
    if (!parsedRule) {
      // Fallback if rule cannot be parsed
      result.push({
        eventId: ev.id,
        uid,
        originalStart: ev.start,
        start: startInstant,
        end: endInstant,
        title: ev.title,
        description: ev.description,
        location: ev.location,
        isAllDay: Boolean(ev.isAllDay),
        isRecurring: true,
        isException: false,
        status: ev.status || 'CONFIRMED',
        organizerEmail: ev.organizer,
        participants: ev.participants,
      });
      continue;
    }

    const seriesStarts = generateSeriesStarts(startInstant, parsedRule, windowFrom, windowTo);
    const overrides = ev.recurrenceOverrides ?? {};
    const seenStarts = new Set<string>();

    for (const s of seriesStarts) {
      const key = s.toISOString().replace('.000Z', 'Z');
      const dateKey = s.toISOString().slice(0, 10);
      const patch = overrides[key] || (ev.isAllDay ? overrides[dateKey] : undefined);

      if (patch?.excluded) {
        continue; // Cancelled occurrence
      }

      const occStart = patch?.start ? new Date(patch.start) : s;
      const occEnd = patch?.end ? new Date(patch.end) : new Date(occStart.getTime() + durationMs);
      const isException = Boolean(patch);

      seenStarts.add(key);
      seenStarts.add(dateKey);

      if (occEnd >= windowFrom && occStart <= windowTo) {
        result.push({
          eventId: ev.id,
          uid,
          originalStart: ev.isAllDay ? dateKey : key,
          start: occStart,
          end: occEnd,
          title: patch?.title || ev.title,
          description: patch?.description !== undefined ? patch.description : ev.description,
          location: patch?.location !== undefined ? patch.location : ev.location,
          isAllDay: Boolean(ev.isAllDay),
          isRecurring: true,
          isException,
          status: patch?.status || ev.status || 'CONFIRMED',
          organizerEmail: ev.organizer,
          participants: ev.participants,
        });
      }
    }

    // Include occurrences moved into the window from outside
    for (const [key, patch] of Object.entries(overrides)) {
      if (patch.excluded || !patch.start || seenStarts.has(key)) continue;
      const s = new Date(patch.start);
      const e = patch.end ? new Date(patch.end) : new Date(s.getTime() + durationMs);
      if (e >= windowFrom && s <= windowTo) {
        result.push({
          eventId: ev.id,
          uid,
          originalStart: key,
          start: s,
          end: e,
          title: patch.title || ev.title,
          description: patch.description !== undefined ? patch.description : ev.description,
          location: patch.location !== undefined ? patch.location : ev.location,
          isAllDay: Boolean(ev.isAllDay),
          isRecurring: true,
          isException: true,
          status: patch.status || ev.status || 'CONFIRMED',
          organizerEmail: ev.organizer,
          participants: ev.participants,
        });
      }
    }
  }

  return result.sort((a, b) => a.start.getTime() - b.start.getTime());
}

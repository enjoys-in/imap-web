import { apiClient, getAuthToken } from '../client';
import { getAccounts, getProfile } from './account';
import { useMailStore } from '@/stores/useMailStore';
import { getClientConfig } from '@/config/clientConfig';
import { DEFAULT_CALENDAR_COLOR, normalizeCalendarColor } from '@/lib/calendarColors';
import { Appointment } from '@/types';

export interface UserCalendar {
  id: string;
  name: string;
  color: string;
  description?: string;
  timezone?: string;
  isDefault?: boolean;
  isVisible?: boolean;
  isReadOnly?: boolean;
}

export interface NewCalendarInput {
  name: string;
  color?: string;
  description?: string;
}

export type CalendarServiceErrorKind = 'unauthorized' | 'unreachable' | 'rejected';

export class CalendarServiceError extends Error {
  readonly kind: CalendarServiceErrorKind;
  readonly isUserNotFound: boolean;
  readonly isUnauthorized: boolean;

  constructor(kind: CalendarServiceErrorKind, message: string, isUserNotFound = false, isUnauthorized = false) {
    super(message);
    this.name = 'CalendarServiceError';
    this.kind = kind;
    this.isUserNotFound = isUserNotFound;
    this.isUnauthorized = isUnauthorized || kind === 'unauthorized';
  }
}

interface JmapCalendar {
  id: string;
  name?: string;
  color?: string;
  description?: string;
  timezone?: string;
  isDefault?: boolean;
  isVisible?: boolean;
  isReadOnly?: boolean;
}

interface JmapSetFailure {
  type?: string;
  description?: string;
}

interface JmapGetResult {
  list?: JmapCalendar[];
}

interface JmapSetResult {
  created?: Record<string, { id?: string }>;
  notCreated?: Record<string, JmapSetFailure>;
  updated?: Record<string, unknown>;
  notUpdated?: Record<string, JmapSetFailure>;
}

interface JmapErrorResult {
  type?: string;
  description?: string;
}

type JmapMethodCall = [method: string, args: Record<string, unknown>, callId: string];
type JmapMethodResponse = [method: string, result: Record<string, unknown>, callId: string];

interface JmapEnvelope {
  methodResponses?: JmapMethodResponse[];
}

const JMAP_USING = ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'];

const UNAUTHORIZED_PATTERN = /user not found|invalid token|authentication required|bearer token required|unauthorized|401/i;
const UNREACHABLE_PATTERN = /failed to fetch|networkerror|network request failed|load failed|econnrefused/i;

export function getCalendarBaseUrl(): string {
  const cfg = getClientConfig();
  return (cfg.calendarApiUrl || cfg.calendarUrl || 'http://localhost:8443').replace(/\/+$/, '');
}

export function toCalendarServiceError(error: unknown): CalendarServiceError {
  if (error instanceof CalendarServiceError) {
    return error;
  }
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as any)?.status ?? (error as any)?.statusCode;
  const is401 = status === 401 || UNAUTHORIZED_PATTERN.test(message);

  if (is401) {
    if (/user not found/i.test(message) || (error as any)?.isUserNotFound) {
      return new CalendarServiceError(
        'unauthorized',
        "Your account is not registered with the calendar service yet (401 User not found). Click below to connect.",
        true,
        true
      );
    }
    return new CalendarServiceError(
      'unauthorized',
      'The calendar server rejected your session (401). Calendar is in view-only mode.',
      false,
      true
    );
  }

  if (error instanceof TypeError || UNREACHABLE_PATTERN.test(message)) {
    return new CalendarServiceError('unreachable', `Can't reach the calendar server at ${getCalendarBaseUrl()}.`, false, false);
  }

  return new CalendarServiceError('rejected', message || 'The calendar server rejected the request.', false, false);
}

/**
 * Resolves the currently active IMAP user credentials (email & name)
 * from the active mail store, account cache, profile, or JWT token.
 */
export async function getActiveImapUser(): Promise<{ email: string; name?: string }> {
  try {
    const selectedAccountId = useMailStore.getState().selectedAccountId;
    const accounts = await getAccounts().catch(() => []);
    const active = (selectedAccountId ? accounts.find((a) => a.id === selectedAccountId) : null) || accounts[0];
    if (active?.email) {
      return {
        email: active.email,
        name: active.displayName || active.userName || undefined,
      };
    }
  } catch {}

  try {
    const profile = await getProfile().catch(() => null);
    if (profile?.email || profile?.mid) {
      return {
        email: profile.email || profile.mid,
        name: profile.displayName || profile.display_name || profile.name || undefined,
      };
    }
  } catch {}

  const token = getAuthToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = payload.email || payload.mid;
      if (email) {
        return {
          email,
          name: payload.display_name || payload.name || undefined,
        };
      }
    } catch {}
  }

  return { email: '' };
}

/**
 * Onboards the current IMAP user into the calendar service (CalDev).
 * Uses the same email/details from IMAP API, ensuring one user per email,
 * and creates their default calendar.
 */
export async function onboardCalendarUser(email?: string, name?: string): Promise<any> {
  let targetEmail = email?.trim();
  let targetName = name?.trim();

  if (!targetEmail) {
    const imapUser = await getActiveImapUser();
    targetEmail = imapUser.email;
    targetName = targetName || imapUser.name;
  }

  const body: Record<string, string> = {};
  if (targetEmail) body.email = targetEmail;
  if (targetName) body.name = targetName;

  const res = await apiClient.post<any>(`${getCalendarBaseUrl()}/api/calendar/onboard`, body);
  return res?.result || res;
}

async function jmapRequest(calls: JmapMethodCall[]): Promise<JmapMethodResponse[]> {
  let envelope: JmapEnvelope;
  try {
    envelope = await apiClient.post<JmapEnvelope>(`${getCalendarBaseUrl()}/jmap/api`, {
      using: JMAP_USING,
      methodCalls: calls,
    });
  } catch (error) {
    throw toCalendarServiceError(error);
  }

  const responses = envelope?.methodResponses ?? [];
  const failure = responses.find(([method]) => method === 'error');
  if (failure) {
    const detail = failure[1] as JmapErrorResult;
    throw new CalendarServiceError(
      'rejected',
      detail.description || detail.type || 'The calendar server rejected the request.'
    );
  }
  return responses;
}

function findResult<T>(responses: JmapMethodResponse[], method: string): T | undefined {
  return responses.find(([name]) => name === method)?.[1] as T | undefined;
}

function toUserCalendar(raw: JmapCalendar): UserCalendar {
  return {
    id: raw.id,
    name: raw.name || 'Untitled Calendar',
    color: normalizeCalendarColor(raw.color),
    description: raw.description,
    timezone: raw.timezone,
    isDefault: raw.isDefault,
    isVisible: raw.isVisible,
    isReadOnly: raw.isReadOnly,
  };
}

export async function getCalendars(): Promise<UserCalendar[]> {
  const responses = await jmapRequest([['Calendar/get', {}, 'c0']]);
  const result = findResult<JmapGetResult>(responses, 'Calendar/get');
  return (result?.list ?? []).map(toUserCalendar);
}

export async function createCalendar(input: NewCalendarInput): Promise<UserCalendar> {
  const tempId = `cal-${Date.now()}`;
  const color = normalizeCalendarColor(input.color ?? DEFAULT_CALENDAR_COLOR);
  const description = input.description?.trim() ?? '';

  const responses = await jmapRequest([
    [
      'Calendar/set',
      { create: { [tempId]: { name: input.name, color, description } } },
      'create-cal',
    ],
  ]);

  const result = findResult<JmapSetResult>(responses, 'Calendar/set');
  const createdId = result?.created?.[tempId]?.id;
  if (!createdId) {
    throw new CalendarServiceError(
      'rejected',
      result?.notCreated?.[tempId]?.description || 'The calendar server did not create the calendar.'
    );
  }

  return { id: createdId, name: input.name, color, description, isVisible: true };
}

export async function updateCalendar(id: string, updates: Partial<UserCalendar>): Promise<UserCalendar> {
  const patchProps: Record<string, unknown> = {};
  if (updates.name !== undefined) patchProps.name = updates.name;
  if (updates.color !== undefined) patchProps.color = normalizeCalendarColor(updates.color);
  if (updates.description !== undefined) patchProps.description = updates.description;
  if (updates.timezone !== undefined) patchProps.timezone = updates.timezone;
  if (updates.isDefault !== undefined) patchProps.isDefault = updates.isDefault;
  if (updates.isVisible !== undefined) patchProps.isVisible = updates.isVisible;

  const responses = await jmapRequest([
    [
      'Calendar/set',
      { update: { [id]: patchProps } },
      'update-cal',
    ],
  ]);

  const result = findResult<JmapSetResult>(responses, 'Calendar/set');
  const failure = result?.notUpdated?.[id];
  if (failure) {
    throw new CalendarServiceError('rejected', failure.description || 'Could not update calendar.');
  }

  const all = await getCalendars();
  const found = all.find((c) => c.id === id);
  if (!found) {
    throw new CalendarServiceError('rejected', 'Calendar not found after update.');
  }
  return found;
}

/**
 * Delete a calendar by ID via CalDev JMAP Calendar/set.
 */
export async function deleteCalendar(id: string): Promise<boolean> {
  try {
    const responses = await jmapRequest([['Calendar/set', { destroy: [id] }, 'del-cal']]);
    const result = findResult<{ destroyed?: string[] }>(responses, 'Calendar/set');
    return result?.destroyed?.includes(id) ?? false;
  } catch (err) {
    console.warn('Calendar service rejected deleteCalendar:', err);
    return false;
  }
}

/**
 * Fetch calendar appointments / events from CalDev JMAP API.
 * Maps RFC JMAP CalendarEvent objects to the UI Appointment model.
 */
export async function getAppointments(calendarId?: string): Promise<Appointment[]> {
  try {
    const url = `${getCalendarBaseUrl()}/jmap/api`;
    const res = await apiClient.post<any>(url, {
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'],
      methodCalls: [
        [
          'CalendarEvent/get',
          calendarId ? { filter: { calendarId } } : {},
          'events0',
        ],
      ],
    });

    const methodResponses = res?.methodResponses || [];
    for (const [name, result] of methodResponses) {
      if (name === 'CalendarEvent/get' && Array.isArray(result?.list)) {
        return result.list.map((ev: any) => ({
          id: ev.id,
          accountId: ev.accountId || '',
          uid: ev.uid || ev.id,
          sequence: ev.sequence || 0,
          title: ev.title || '',
          location: ev.location,
          startUtc: ev.start,
          endUtc: ev.end || ev.start,
          isAllDay: Boolean(ev.isAllDay),
          isRecurring: Boolean(ev.recurrenceRules && ev.recurrenceRules.length > 0),
          organizerEmail: ev.organizer || '',
          organizerName: '',
          isOrganizer: true,
          attendees: JSON.stringify(ev.participants || []),
          myResponse: 'Accepted',
          showAs: 'Busy',
          notes: ev.description,
        }));
      }
    }
    return [];
  } catch (err) {
    console.warn('Calendar service unreachable (getAppointments):', err);
    return [];
  }
}

/**
 * Create a new calendar appointment / event via CalDev JMAP CalendarEvent/set.
 */
export async function createAppointment(
  data: Omit<Appointment, 'id'> & { calendarId?: string }
): Promise<Appointment | null> {
  const tempId = `evt-${Date.now()}`;
  try {
    const url = `${getCalendarBaseUrl()}/jmap/api`;
    const res = await apiClient.post<any>(url, {
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'],
      methodCalls: [
        [
          'CalendarEvent/set',
          {
            create: {
              [tempId]: {
                title: data.title,
                start: data.startUtc,
                end: data.endUtc,
                location: data.location,
                description: data.notes,
                isAllDay: data.isAllDay,
                calendarId: data.calendarId,
              },
            },
          },
          'create-event',
        ],
      ],
    });

    const methodResponses = res?.methodResponses || [];
    for (const [name, result] of methodResponses) {
      if (name === 'CalendarEvent/set' && result?.created?.[tempId]) {
        return {
          id: result.created[tempId].id,
          ...data,
        };
      }
    }
    return { id: tempId, ...data };
  } catch (err) {
    console.warn('Calendar service unreachable (createAppointment), operating locally:', err);
    return { id: tempId, ...data };
  }
}

/**
 * Update an existing calendar appointment / event via CalDev JMAP CalendarEvent/set.
 */
export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
): Promise<Appointment | null> {
  try {
    const url = `${getCalendarBaseUrl()}/jmap/api`;
    const updatePatch: Record<string, any> = {};
    if (data.title !== undefined) updatePatch.title = data.title;
    if (data.startUtc !== undefined) updatePatch.start = data.startUtc;
    if (data.endUtc !== undefined) updatePatch.end = data.endUtc;
    if (data.location !== undefined) updatePatch.location = data.location;
    if (data.notes !== undefined) updatePatch.description = data.notes;
    if (data.isAllDay !== undefined) updatePatch.isAllDay = data.isAllDay;

    await apiClient.post<any>(url, {
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'],
      methodCalls: [
        [
          'CalendarEvent/set',
          {
            update: {
              [id]: updatePatch,
            },
          },
          'update-event',
        ],
      ],
    });

    return { id, ...data } as Appointment;
  } catch (err) {
    console.warn(`Calendar updateAppointment ${id} failed:`, err);
    return { id, ...data } as Appointment;
  }
}

/**
 * Delete a calendar appointment / event via CalDev JMAP CalendarEvent/set.
 */
export async function deleteAppointment(id: string): Promise<boolean> {
  try {
    const url = `${getCalendarBaseUrl()}/jmap/api`;
    await apiClient.post<any>(url, {
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'],
      methodCalls: [['CalendarEvent/set', { destroy: [id] }, 'del-event']],
    });
    return true;
  } catch (err) {
    console.warn(`Calendar deleteAppointment ${id} failed:`, err);
    return false;
  }
}

/**
 * Subscribes to JMAP EventSource push notifications (RFC 8620 §7).
 * Pushes real-time state changes for CalendarEvent and Calendar to the client.
 * Returns an unsubscribe teardown function.
 */
export function subscribeCalendarEvents(
  onStateChange: (data: { type: string; changed?: Record<string, Record<string, string>> }) => void
): () => void {
  if (typeof window === 'undefined' || !window.EventSource) {
    return () => {};
  }

  const token = getAuthToken();
  const baseUrl = getCalendarBaseUrl();
  const url = token
    ? `${baseUrl}/jmap/eventsource?token=${encodeURIComponent(token)}`
    : `${baseUrl}/jmap/eventsource`;

  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener('state', (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onStateChange(parsed);
      } catch (err) {
        console.warn('Failed to parse JMAP push event:', err);
      }
    });

    eventSource.onmessage = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onStateChange(parsed);
      } catch {}
    };

    eventSource.onerror = () => {
      // EventSource automatically reconnects on error according to the server's retry directive
    };
  } catch (err) {
    console.warn('JMAP EventSource push connection failed:', err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

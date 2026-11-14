import { apiClient, getAuthToken } from '../client';
import { getAccounts, getProfile } from './account';
import { useMailStore } from '@/stores/useMailStore';
import { getClientConfig } from '@/config/clientConfig';
import { DEFAULT_CALENDAR_COLOR, normalizeCalendarColor } from '@/lib/calendarColors';
import { Appointment } from '@/types';
import {
  expandEventOccurrences,
  type RawJmapEvent,
  type ExpandedOccurrence,
} from '@/lib/calendarRecurrence';

export interface UserCalendar {
  id: string;
  name: string;
  color: string;
  description?: string;
  timezone?: string;
  isDefault?: boolean;
  isVisible?: boolean;
  isReadOnly?: boolean;
  ownerEmail?: string;
  tenant_id?: string;
  tenantId?: string;
}

export interface SharedCalendar extends UserCalendar {
  ownerEmail: string;
  privilege: 'read';
}

export interface NewCalendarInput {
  name: string;
  color?: string;
  description?: string;
}

export interface TeammateAvailability {
  userId?: number;
  email: string;
  name?: string;
  allowed: boolean;
  busy: boolean;
  busyStatus?: 'confirmed' | 'tentative';
  until?: string;
  nextBusyAt?: string;
  busyBlocks?: { start: string; end: string; status: 'confirmed' | 'tentative' }[];
}

export interface AvailabilitySharesResult {
  shared_by_me: { user_id: number; email: string; name?: string; created_at: string }[];
  shared_with_me: { user_id: number; email: string; name?: string; created_at: string }[];
  org_visible: boolean;
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
  state?: string;
}

interface JmapSetResult {
  created?: Record<string, { id?: string; uid?: string; etag?: string }>;
  notCreated?: Record<string, JmapSetFailure>;
  updated?: Record<string, unknown>;
  notUpdated?: Record<string, JmapSetFailure>;
  destroyed?: string[];
  notDestroyed?: Record<string, JmapSetFailure>;
  newState?: string;
}

interface JmapErrorResult {
  type?: string;
  description?: string;
}

type JmapMethodCall = [method: string, args: Record<string, unknown>, callId: string];
type JmapMethodResponse = [method: string, result: Record<string, unknown>, callId: string];

interface JmapEnvelope {
  methodResponses?: JmapMethodResponse[];
  sessionState?: string;
}

const JMAP_USING = ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'];
const UNAUTHORIZED_PATTERN = /user not found|invalid token|authentication required|bearer token required|unauthorized|401/i;
const UNREACHABLE_PATTERN = /failed to fetch|networkerror|network request failed|load failed|econnrefused/i;

let cachedAccountId: string | null = null;
let latestCalState: string | null = null;
let latestEventState: string | null = null;

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
        'Your account is not registered with the calendar service yet (401 User not found). Click below to connect.',
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
 * and extracts the tenantId from the email domain.
 */
export async function getActiveImapUser(): Promise<{ email: string; name?: string; tenantId?: string; domain?: string }> {
  try {
    const selectedAccountId = useMailStore.getState().selectedAccountId;
    const accounts = await getAccounts().catch(() => []);
    const active = (selectedAccountId ? accounts.find((a) => a.id === selectedAccountId) : null) || accounts[0];
    if (active?.email) {
      const domain = active.email.includes('@') ? active.email.split('@')[1].trim().toLowerCase() : '';
      return {
        email: active.email,
        name: active.displayName || active.userName || undefined,
        tenantId: domain,
        domain,
      };
    }
  } catch {}

  try {
    const profile = await getProfile().catch(() => null);
    if (profile?.email || profile?.mid) {
      const email = (profile.email || profile.mid || '').trim();
      const domain = email.includes('@')
        ? email.split('@')[1].trim().toLowerCase()
        : (profile.domain_name || '');
      return {
        email,
        name: profile.displayName || profile.display_name || profile.name || undefined,
        tenantId: domain,
        domain,
      };
    }
  } catch {}

  const token = getAuthToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const email = (payload.email || payload.mid || '').trim();
      if (email) {
        const domain = email.includes('@')
          ? email.split('@')[1].trim().toLowerCase()
          : (payload.domain_name || '');
        return {
          email,
          name: payload.display_name || payload.name || undefined,
          tenantId: domain,
          domain,
        };
      }
    } catch {}
  }

  return { email: '', tenantId: '', domain: '' };
}

/**
 * Resolves the CalDev JMAP accountId via GET /jmap/session
 */
export async function getJmapAccountId(): Promise<string> {
  if (cachedAccountId) return cachedAccountId;

  try {
    const sessionUrl = `${getCalendarBaseUrl()}/jmap/session`;
    const res = await apiClient.get<any>(sessionUrl);
    const primary = res?.primaryAccounts?.['urn:ietf:params:jmap:calendars'];
    if (primary) {
      cachedAccountId = primary;
      return primary;
    }
    if (res?.accounts && typeof res.accounts === 'object') {
      const first = Object.keys(res.accounts)[0];
      if (first) {
        cachedAccountId = first;
        return first;
      }
    }
  } catch (err) {
    console.warn('[CalDev] Session discovery failed, using fallback:', err);
  }
  return '0:0';
}

/**
 * Executes JMAP method calls through POST /jmap/api
 */
export async function jmapRequest(calls: JmapMethodCall[]): Promise<JmapMethodResponse[]> {
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

/**
 * Onboards the current IMAP user into CalDev.
 * Supplies the user's email and uses the domain of the email as the tenant_id (not numeric ID).
 */
export async function onboardCalendarUser(email?: string, name?: string): Promise<any> {
  let targetEmail = email?.trim();
  let targetName = name?.trim();

  const imapUser = await getActiveImapUser().catch(() => ({ email: '', name: '', tenantId: '', domain: '' }));

  if (!targetEmail) {
    targetEmail = imapUser.email;
    targetName = targetName || imapUser.name;
  }

  const domain = targetEmail && targetEmail.includes('@')
    ? targetEmail.split('@')[1].trim().toLowerCase()
    : (imapUser.tenantId || imapUser.domain || '');

  const body: Record<string, string> = {};
  if (targetEmail) body.email = targetEmail;
  if (targetName) body.name = targetName;
  if (domain) {
    body.tenant_id = domain;
    body.tenant = domain;
    body.domain = domain;
  }

  const headers: Record<string, string> = {};
  if (domain) {
    headers['X-Tenant-ID'] = domain;
  }

  const res = await apiClient.post<any>(`${getCalendarBaseUrl()}/api/calendar/onboard`, body, { headers });
  const result = res?.result || res;
  if (result && typeof result === 'object') {
    const resolvedDomain = (result.email || targetEmail || '').split('@')[1]?.toLowerCase() || domain;
    if (resolvedDomain) {
      result.tenant_id = resolvedDomain;
      result.tenant = resolvedDomain;
      result.domain = resolvedDomain;
    }
  }
  return result;
}

/**
 * Fetch user's calendars via JMAP Calendar/get
 */
export async function getCalendars(): Promise<UserCalendar[]> {
  const accountId = await getJmapAccountId();
  const responses = await jmapRequest([['Calendar/get', { accountId }, 'c0']]);
  const result = findResult<JmapGetResult>(responses, 'Calendar/get');
  if (result?.state) latestCalState = result.state;
  return (result?.list ?? []).map(toUserCalendar);
}

/**
 * Create a calendar via JMAP Calendar/set
 */
export async function createCalendar(input: NewCalendarInput): Promise<UserCalendar> {
  const accountId = await getJmapAccountId();
  const tempId = `cal-${Date.now()}`;
  const color = normalizeCalendarColor(input.color ?? DEFAULT_CALENDAR_COLOR);
  const description = input.description?.trim() ?? '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

  const responses = await jmapRequest([
    [
      'Calendar/set',
      {
        accountId,
        create: {
          [tempId]: {
            name: input.name,
            color,
            description,
            timezone,
          },
        },
      },
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

  return { id: createdId, name: input.name, color, description, isVisible: true, timezone };
}

/**
 * Update an existing calendar via JMAP Calendar/set
 */
export async function updateCalendar(id: string, updates: Partial<UserCalendar>): Promise<UserCalendar> {
  const accountId = await getJmapAccountId();
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
      { accountId, update: { [id]: patchProps } },
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
 * Delete a calendar by ID via JMAP Calendar/set
 */
export async function deleteCalendar(id: string): Promise<boolean> {
  try {
    const accountId = await getJmapAccountId();
    const responses = await jmapRequest([['Calendar/set', { accountId, destroy: [id] }, 'del-cal']]);
    const result = findResult<{ destroyed?: string[] }>(responses, 'Calendar/set');
    return result?.destroyed?.includes(id) ?? false;
  } catch (err) {
    console.warn('Calendar service rejected deleteCalendar:', err);
    return false;
  }
}

/**
 * Maps expanded occurrence into UI Appointment model
 */
function occurrenceToAppointment(
  occ: ExpandedOccurrence,
  myEmail: string
): Appointment {
  const startStr = occ.start.toISOString();
  const endStr = occ.end.toISOString();
  const isOrganizer = !occ.organizerEmail || occ.organizerEmail.toLowerCase() === myEmail.toLowerCase();

  let myResponse: Appointment['myResponse'] = 'Accepted';
  if (!isOrganizer && occ.participants && myEmail) {
    const p = Object.values(occ.participants).find(
      (part) => part.email?.toLowerCase() === myEmail.toLowerCase()
    );
    if (p?.participationStatus === 'NEEDS-ACTION') myResponse = 'NeedsAction';
    else if (p?.participationStatus === 'DECLINED') myResponse = 'Declined';
    else if (p?.participationStatus === 'TENTATIVE') myResponse = 'Tentative';
    else if (p?.participationStatus === 'ACCEPTED') myResponse = 'Accepted';
  }

  return {
    id: occ.eventId,
    accountId: '',
    uid: occ.uid,
    sequence: 0,
    title: occ.title || 'Untitled Event',
    location: occ.location,
    startUtc: startStr,
    endUtc: endStr,
    isAllDay: occ.isAllDay,
    isRecurring: occ.isRecurring,
    organizerEmail: occ.organizerEmail || '',
    organizerName: occ.organizerEmail?.split('@')[0] || '',
    isOrganizer,
    attendees: JSON.stringify(occ.participants || {}),
    myResponse,
    showAs: 'Busy',
    notes: occ.description,
  };
}

/**
 * Fetch calendar appointments / events from CalDev JMAP API.
 * Uses CalendarEvent/query + CalendarEvent/get, then expands recurring
 * occurrences client-side according to UI_GUIDE.md Section 6.
 */
export async function getAppointments(
  calendarId?: string,
  windowStart?: Date,
  windowEnd?: Date
): Promise<Appointment[]> {
  try {
    const accountId = await getJmapAccountId();
    const myUser = await getActiveImapUser();

    // Default window: -30 days to +90 days
    const fromDate = windowStart || new Date(Date.now() - 30 * 86400000);
    const toDate = windowEnd || new Date(Date.now() + 90 * 86400000);

    const filter: Record<string, unknown> = {
      after: fromDate.toISOString(),
      before: toDate.toISOString(),
    };
    if (calendarId) filter.calendarId = calendarId;

    const queryCall: JmapMethodCall = [
      'CalendarEvent/query',
      { accountId, filter, limit: 300, position: 0 },
      'q0',
    ];

    const responses = await jmapRequest([queryCall]);
    const queryResult = findResult<{ ids?: string[]; total?: number }>(responses, 'CalendarEvent/query');
    const ids = queryResult?.ids || [];

    if (ids.length === 0) {
      return [];
    }

    // Fetch full event definitions by ids
    const getCall: JmapMethodCall = [
      'CalendarEvent/get',
      { accountId, ids },
      'g0',
    ];
    const getResponses = await jmapRequest([getCall]);
    const getResult = findResult<{ list?: RawJmapEvent[]; state?: string }>(getResponses, 'CalendarEvent/get');

    if (getResult?.state) {
      latestEventState = getResult.state;
    }

    const rawList = getResult?.list || [];
    const occurrences = expandEventOccurrences(rawList, fromDate, toDate);
    return occurrences.map((occ) => occurrenceToAppointment(occ, myUser.email));
  } catch (err) {
    console.warn('[CalDev] getAppointments failed:', err);
    return [];
  }
}

export interface CreateAppointmentInput {
  title: string;
  startUtc: string;
  endUtc: string;
  location?: string;
  notes?: string;
  isAllDay?: boolean;
  calendarId?: string;
  timeZone?: string;
  attendees?: string[] | string;
  recurrenceRule?: string; // e.g. "FREQ=WEEKLY;BYDAY=MO"
  accountId?: string;
  uid?: string;
  sequence?: number;
  isRecurring?: boolean;
  organizerEmail?: string;
  organizerName?: string;
  isOrganizer?: boolean;
  myResponse?: string;
  showAs?: string;
}

/**
 * Create a new calendar event via JMAP CalendarEvent/set
 * Sends proper timeZone and participants. Never sends organizer.
 */
export async function createAppointment(
  data: CreateAppointmentInput
): Promise<Appointment | null> {
  const accountId = await getJmapAccountId();
  const tempId = `evt-${Date.now()}`;
  const myUser = await getActiveImapUser();
  const timeZone = data.isAllDay ? undefined : (data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata');

  const createObj: Record<string, unknown> = {
    title: data.title,
    start: data.startUtc,
    end: data.endUtc,
    location: data.location || '',
    description: data.notes || '',
    isAllDay: Boolean(data.isAllDay),
  };

  if (timeZone) createObj.timeZone = timeZone;
  if (data.calendarId) createObj.calendarId = data.calendarId;

  if (data.attendees) {
    const list = Array.isArray(data.attendees)
      ? data.attendees
      : typeof data.attendees === 'string' && data.attendees.trim()
      ? data.attendees.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean)
      : [];

    if (list.length > 0) {
      const participants: Record<string, unknown> = {};
      list.forEach((email, idx) => {
        participants[`p${idx + 1}`] = {
          name: email.split('@')[0],
          email: email.trim(),
          kind: 'individual',
          expectReply: true,
        };
      });
      createObj.participants = participants;
    }
  }

  if (data.recurrenceRule) {
    createObj.recurrenceRules = [{ rule: data.recurrenceRule.replace(/^RRULE:/i, '') }];
  }

  try {
    const responses = await jmapRequest([
      [
        'CalendarEvent/set',
        { accountId, create: { [tempId]: createObj } },
        'create-event',
      ],
    ]);

    const result = findResult<JmapSetResult>(responses, 'CalendarEvent/set');
    const createdInfo = result?.created?.[tempId];

    return {
      id: createdInfo?.id || tempId,
      accountId,
      uid: createdInfo?.uid || tempId,
      sequence: 0,
      title: data.title,
      location: data.location,
      startUtc: data.startUtc,
      endUtc: data.endUtc,
      isAllDay: Boolean(data.isAllDay),
      isRecurring: Boolean(data.recurrenceRule),
      organizerEmail: myUser.email,
      organizerName: myUser.name || myUser.email,
      isOrganizer: true,
      attendees: JSON.stringify(data.attendees || []),
      myResponse: 'Accepted',
      showAs: 'Busy',
      notes: data.notes,
    };
  } catch (err) {
    console.warn('[CalDev] createAppointment failed:', err);
    throw toCalendarServiceError(err);
  }
}

export interface UpdateAppointmentOptions {
  isOccurrenceOnly?: boolean;
  originalStart?: string;
}

/**
 * Update an existing calendar event or single occurrence exception
 */
export async function updateAppointment(
  id: string,
  data: Partial<Appointment>,
  options?: UpdateAppointmentOptions
): Promise<Appointment | null> {
  const accountId = await getJmapAccountId();

  try {
    let updatePayload: Record<string, unknown>;

    if (options?.isOccurrenceOnly && options.originalStart) {
      // Single occurrence exception
      const patch: Record<string, unknown> = {};
      if (data.title !== undefined) patch.title = data.title;
      if (data.startUtc !== undefined) patch.start = data.startUtc;
      if (data.endUtc !== undefined) patch.end = data.endUtc;
      if (data.location !== undefined) patch.location = data.location;
      if (data.notes !== undefined) patch.description = data.notes;

      updatePayload = {
        recurrenceOverrides: {
          [options.originalStart]: patch,
        },
      };
    } else {
      // Entire series or normal event
      const patch: Record<string, unknown> = {};
      if (data.title !== undefined) patch.title = data.title;
      if (data.startUtc !== undefined) patch.start = data.startUtc;
      if (data.endUtc !== undefined) patch.end = data.endUtc;
      if (data.location !== undefined) patch.location = data.location;
      if (data.notes !== undefined) patch.description = data.notes;
      if (data.isAllDay !== undefined) patch.isAllDay = data.isAllDay;
      updatePayload = patch;
    }

    await jmapRequest([
      [
        'CalendarEvent/set',
        { accountId, update: { [id]: updatePayload } },
        'update-event',
      ],
    ]);

    return { id, ...data } as Appointment;
  } catch (err) {
    console.warn(`[CalDev] updateAppointment ${id} failed:`, err);
    throw toCalendarServiceError(err);
  }
}

/**
 * Delete a calendar event or cancel a single occurrence
 */
export async function deleteAppointment(
  id: string,
  options?: { isOccurrenceOnly?: boolean; originalStart?: string }
): Promise<boolean> {
  const accountId = await getJmapAccountId();

  try {
    if (options?.isOccurrenceOnly && options.originalStart) {
      // Cancel single occurrence via { excluded: true }
      await jmapRequest([
        [
          'CalendarEvent/set',
          {
            accountId,
            update: {
              [id]: {
                recurrenceOverrides: {
                  [options.originalStart]: { excluded: true },
                },
              },
            },
          },
          'cancel-occurrence',
        ],
      ]);
    } else {
      // Destroy whole event
      await jmapRequest([
        ['CalendarEvent/set', { accountId, destroy: [id] }, 'del-event'],
      ]);
    }
    return true;
  } catch (err) {
    console.warn(`[CalDev] deleteAppointment ${id} failed:`, err);
    return false;
  }
}

/**
 * RSVP to an invitation (Accept / Decline / Maybe) via POST /api/scheduling/rsvp
 */
export async function rsvpAppointment(
  eventUid: string,
  response: 'accept' | 'decline' | 'maybe'
): Promise<{ success: boolean; result?: any }> {
  try {
    const url = `${getCalendarBaseUrl()}/api/scheduling/rsvp`;
    const res = await apiClient.post<any>(url, {
      event_uid: eventUid,
      response,
    });
    return { success: true, result: res?.result || res };
  } catch (err) {
    console.warn('[CalDev] RSVP failed:', err);
    throw toCalendarServiceError(err);
  }
}

// ──────────────── Team Availability (Free / Busy) APIs ────────────────

export async function getAvailabilityShares(): Promise<AvailabilitySharesResult> {
  try {
    const url = `${getCalendarBaseUrl()}/api/availability/shares`;
    const res = await apiClient.get<any>(url);
    const result = res?.result || res;
    return {
      shared_by_me: result?.shared_by_me || [],
      shared_with_me: result?.shared_with_me || [],
      org_visible: Boolean(result?.org_visible),
    };
  } catch (err) {
    console.warn('[CalDev] getAvailabilityShares failed:', err);
    return { shared_by_me: [], shared_with_me: [], org_visible: false };
  }
}

export async function shareAvailability(email: string): Promise<any> {
  const url = `${getCalendarBaseUrl()}/api/availability/shares`;
  const res = await apiClient.post<any>(url, { email: email.trim() });
  return res?.result || res;
}

export async function revokeAvailabilityShare(userId: number | string): Promise<boolean> {
  try {
    const url = `${getCalendarBaseUrl()}/api/availability/shares/${userId}`;
    await apiClient.delete(url);
    return true;
  } catch (err) {
    console.warn('[CalDev] revokeAvailabilityShare failed:', err);
    return false;
  }
}

export async function getAvailability(
  emails: string[],
  start?: string,
  end?: string
): Promise<TeammateAvailability[]> {
  if (emails.length === 0) return [];
  try {
    const params = new URLSearchParams();
    params.set('emails', emails.join(','));
    if (start) params.set('start', start);
    if (end) params.set('end', end);

    const url = `${getCalendarBaseUrl()}/api/availability?${params.toString()}`;
    const res = await apiClient.get<any>(url);
    const results = res?.result?.results || [];

    return results.map((r: any) => ({
      userId: r.user_id,
      email: r.email,
      name: r.name || r.email.split('@')[0],
      allowed: Boolean(r.allowed),
      busy: Boolean(r.current?.busy),
      busyStatus: r.current?.busyStatus,
      until: r.current?.until,
      nextBusyAt: r.current?.nextBusyAt,
      busyBlocks: r.busy || [],
    }));
  } catch (err) {
    console.warn('[CalDev] getAvailability failed:', err);
    return [];
  }
}

// ──────────────── Calendar Sharing APIs ────────────────

export async function getSharedCalendars(): Promise<SharedCalendar[]> {
  try {
    const url = `${getCalendarBaseUrl()}/api/shared/calendars`;
    const res = await apiClient.get<any>(url);
    const calendars = res?.result?.calendars || [];
    return calendars.map((c: any) => ({
      id: c.id,
      name: c.name || 'Shared Calendar',
      color: normalizeCalendarColor(c.color),
      description: c.description,
      timezone: c.timezone,
      isDefault: false,
      isVisible: true,
      isReadOnly: true,
      ownerEmail: c.owner_email || 'teammate',
      privilege: 'read' as const,
    }));
  } catch (err) {
    console.warn('[CalDev] getSharedCalendars failed:', err);
    return [];
  }
}

export async function getCalendarShares(calendarId: string): Promise<{ user_id: number; email: string; name?: string; created_at: string }[]> {
  try {
    const url = `${getCalendarBaseUrl()}/api/calendars/${calendarId}/shares`;
    const res = await apiClient.get<any>(url);
    return res?.result?.shares || res?.result || [];
  } catch (err) {
    console.warn('[CalDev] getCalendarShares failed:', err);
    return [];
  }
}

export async function shareCalendar(calendarId: string, email: string): Promise<any> {
  const url = `${getCalendarBaseUrl()}/api/calendars/${calendarId}/shares`;
  const res = await apiClient.post<any>(url, { email: email.trim() });
  return res?.result || res;
}

export async function revokeCalendarShare(calendarId: string, userId: number | string): Promise<boolean> {
  try {
    const url = `${getCalendarBaseUrl()}/api/calendars/${calendarId}/shares/${userId}`;
    await apiClient.delete(url);
    return true;
  } catch (err) {
    console.warn('[CalDev] revokeCalendarShare failed:', err);
    return false;
  }
}

/**
 * Fetch expanded events from a calendar shared with the current user.
 * GET /api/shared/calendars/:id/events?start=...&end=... (UI_GUIDE.md Section 9)
 */
export async function getSharedCalendarEvents(
  calendarId: string,
  start?: Date,
  end?: Date
): Promise<Appointment[]> {
  try {
    const fromDate = start || new Date(Date.now() - 30 * 86400000);
    const toDate = end || new Date(Date.now() + 90 * 86400000);

    const params = new URLSearchParams({
      start: fromDate.toISOString(),
      end: toDate.toISOString(),
    });

    const url = `${getCalendarBaseUrl()}/api/shared/calendars/${calendarId}/events?${params.toString()}`;
    const res = await apiClient.get<any>(url);
    const events = res?.result?.events || res?.result || [];

    return events.map((e: any) => ({
      id: e.id,
      accountId: '',
      uid: e.uid || e.id,
      sequence: 0,
      title: e.private ? 'Busy' : e.title || 'Busy',
      location: e.private ? undefined : e.location,
      startUtc: e.start,
      endUtc: e.end,
      isAllDay: Boolean(e.is_all_day),
      isRecurring: Boolean(e.recurring),
      organizerEmail: 'shared',
      organizerName: 'Shared Calendar',
      isOrganizer: false,
      attendees: '[]',
      myResponse: 'Accepted',
      showAs: 'Busy',
      notes: e.private ? undefined : e.description,
    }));
  } catch (err) {
    console.warn(`[CalDev] getSharedCalendarEvents for ${calendarId} failed:`, err);
    return [];
  }
}

// ──────────────── Live Updates via SSE Stream (UI_GUIDE.md Section 10) ────────────────

export interface CalendarEventSourceHandlers {
  onState?: (changed: Record<string, { CalendarEvent?: string; Calendar?: string }>) => void;
  onAvailability?: (data: {
    accountId: string;
    userId: number;
    email: string;
    name?: string;
    busy: boolean;
    busyStatus?: string;
    until?: string;
    nextBusyAt?: string;
  }) => void;
  onShares?: () => void;
  onResync?: () => void;
}

class LiveCalendarStream {
  private static instance: LiveCalendarStream | null = null;
  private es: EventSource | null = null;
  private backoff = 1000;
  private isClosed = false;
  private renewalTimer: any = null;
  private handlers = new Set<CalendarEventSourceHandlers>();

  public static getInstance(): LiveCalendarStream {
    if (!LiveCalendarStream.instance) {
      LiveCalendarStream.instance = new LiveCalendarStream();
    }
    return LiveCalendarStream.instance;
  }

  public subscribe(handler: CalendarEventSourceHandlers): () => void {
    this.handlers.add(handler);
    if (!this.es && !this.isClosed) {
      void this.connect();
    }
    return () => {
      this.handlers.delete(handler);
      if (this.handlers.size === 0) {
        this.close();
      }
    };
  }

  private async connect() {
    if (this.isClosed || typeof window === 'undefined' || !window.EventSource) return;

    this.teardownCurrent();

    const token = getAuthToken();
    const baseUrl = getCalendarBaseUrl();
    const url = token
      ? `${baseUrl}/jmap/eventsource?access_token=${encodeURIComponent(token)}&token=${encodeURIComponent(token)}`
      : `${baseUrl}/jmap/eventsource`;

    try {
      const es = new EventSource(url, { withCredentials: true });
      this.es = es;

      es.onopen = () => {
        this.backoff = 1000;
      };

      // 1. "state" event: changes to own events / calendars
      es.addEventListener('state', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          const changed = parsed.changed || {};
          this.handlers.forEach((h) => h.onState?.(changed));
        } catch (err) {
          console.warn('[CalDev SSE] Failed to parse state frame:', err);
        }
      });

      // 2. "availability" event: teammate busy/free updates
      es.addEventListener('availability', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          this.handlers.forEach((h) => h.onAvailability?.(parsed));
        } catch (err) {
          console.warn('[CalDev SSE] Failed to parse availability frame:', err);
        }
      });

      // 3. "shares" event: shares added or removed
      es.addEventListener('shares', () => {
        this.handlers.forEach((h) => h.onShares?.());
      });

      // 4. "resync" event: missed events or resync required
      es.addEventListener('resync', () => {
        this.handlers.forEach((h) => h.onResync?.());
      });

      es.onerror = () => {
        // Server closes stream every 30 minutes on purpose; reconnect with exponential backoff
        this.teardownCurrent();
        if (!this.isClosed) {
          setTimeout(() => void this.connect(), this.backoff);
          this.backoff = Math.min(this.backoff * 2, 30000);
        }
      };

      // Proactively refresh after 28 minutes before the 30-minute server cut-off
      this.renewalTimer = setTimeout(() => {
        void this.connect();
      }, 28 * 60 * 1000);
    } catch (err) {
      console.warn('[CalDev SSE] Connection failed:', err);
    }
  }

  private teardownCurrent() {
    if (this.renewalTimer) {
      clearTimeout(this.renewalTimer);
      this.renewalTimer = null;
    }
    if (this.es) {
      this.es.close();
      this.es = null;
    }
  }

  public close() {
    this.isClosed = true;
    this.teardownCurrent();
    LiveCalendarStream.instance = null;
  }
}

/**
 * Subscribes to live CalDev SSE stream notifications.
 * Automatically handles reconnection, 30m lifecycle, and event dispatch.
 */
export function subscribeCalendarEvents(
  handlerOrCallback:
    | CalendarEventSourceHandlers
    | ((data: { type: string; changed?: Record<string, Record<string, string>> }) => void)
): () => void {
  const stream = LiveCalendarStream.getInstance();

  if (typeof handlerOrCallback === 'function') {
    return stream.subscribe({
      onState: (changed) => handlerOrCallback({ type: 'state', changed: changed as any }),
      onResync: () => handlerOrCallback({ type: 'resync' }),
      onShares: () => handlerOrCallback({ type: 'shares' }),
    });
  }

  return stream.subscribe(handlerOrCallback);
}

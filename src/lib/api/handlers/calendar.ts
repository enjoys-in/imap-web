import { apiClient } from '../client';
import { getClientConfig } from '@/config/clientConfig';
import { Appointment } from '@/types';

export interface UserCalendar {
  id: string;
  name: string;
  color: string;
  description?: string;
  timezone?: string;
  isDefault?: boolean;
  isVisible?: boolean;
}

/**
 * Resolves the calendar server base URL from client configuration.
 * Configured in public/config.js via calendarApiUrl or calendarUrl.
 */
export function getCalendarBaseUrl(): string {
  const cfg = getClientConfig();
  return (cfg.calendarApiUrl || cfg.calendarUrl || 'http://localhost:8443').replace(/\/+$/, '');
}

/**
 * Fetch all calendars for the authenticated user from CalDev JMAP API.
 * If the calendar service is unreachable, returns an empty array so UI operates smoothly.
 */
export async function getCalendars(): Promise<UserCalendar[]> {
  try {
    const url = `${getCalendarBaseUrl()}/jmap/api`;
    const res = await apiClient.post<any>(url, {
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'],
      methodCalls: [['Calendar/get', {}, 'c0']],
    });

    const methodResponses = res?.methodResponses || [];
    for (const [name, result] of methodResponses) {
      if (name === 'Calendar/get' && Array.isArray(result?.list)) {
        return result.list.map((cal: any) => ({
          id: cal.id,
          name: cal.name || 'Untitled Calendar',
          color: cal.color || '#0078D4',
          description: cal.description,
          timezone: cal.timezone,
          isDefault: cal.isDefault,
          isVisible: cal.isVisible,
        }));
      }
    }
    return [];
  } catch (err) {
    console.warn('Calendar service unreachable (getCalendars), returning empty list:', err);
    return [];
  }
}

/**
 * Create a new calendar with a custom name and color.
 * Supports multiple calendars under the same user account.
 */
export async function createCalendar(data: {
  name: string;
  color?: string;
  description?: string;
}): Promise<UserCalendar | null> {
  const tempId = `cal-${Date.now()}`;
  try {
    const url = `${getCalendarBaseUrl()}/jmap/api`;
    const res = await apiClient.post<any>(url, {
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'],
      methodCalls: [
        [
          'Calendar/set',
          {
            create: {
              [tempId]: {
                name: data.name,
                color: data.color || '#0078D4',
                description: data.description || '',
              },
            },
          },
          'create-cal',
        ],
      ],
    });

    const methodResponses = res?.methodResponses || [];
    for (const [name, result] of methodResponses) {
      if (name === 'Calendar/set' && result?.created?.[tempId]) {
        return {
          id: result.created[tempId].id,
          name: data.name,
          color: data.color || '#0078D4',
          description: data.description,
        };
      }
    }
    return { id: tempId, name: data.name, color: data.color || '#0078D4' };
  } catch (err) {
    console.warn('Calendar service unreachable (createCalendar), operating locally:', err);
    return { id: tempId, name: data.name, color: data.color || '#0078D4' };
  }
}

/**
 * Delete a calendar by ID.
 */
export async function deleteCalendar(id: string): Promise<boolean> {
  try {
    const url = `${getCalendarBaseUrl()}/jmap/api`;
    await apiClient.post<any>(url, {
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'],
      methodCalls: [['Calendar/set', { destroy: [id] }, 'del-cal']],
    });
    return true;
  } catch (err) {
    console.warn('Calendar service unreachable (deleteCalendar):', err);
    return false;
  }
}

function unwrapList(res: any): Appointment[] {
  const list = Array.isArray(res?.result)
    ? res.result
    : Array.isArray(res)
    ? res
    : res?.result?.appointments;
  return Array.isArray(list) ? list : [];
}

/**
 * Fetch calendar appointments / events.
 * First queries CalDev JMAP API using calendarApiUrl.
 * Falls back to /appointments or returns an empty array if unreachable.
 */
export async function getAppointments(calendarId?: string): Promise<Appointment[]> {
  // 1. Try CalDev JMAP API
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
  } catch {
    // If CalDev JMAP is unreachable, try fallback
  }

  // 2. Fallback to /appointments (if supported)
  try {
    const res = await apiClient.get<any>('/appointments');
    return unwrapList(res);
  } catch {
    return [];
  }
}

/**
 * Create a new calendar appointment / event.
 */
export async function createAppointment(data: Omit<Appointment, 'id'> & { calendarId?: string }): Promise<Appointment | null> {
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
  } catch {
    // CalDev unreachable, try /appointments fallback
  }

  try {
    const res = await apiClient.post<any>('/appointments', data);
    return res?.result || res;
  } catch (err) {
    console.warn('Calendar createAppointment failed (server unreachable):', err);
    return null;
  }
}

/**
 * Delete a calendar appointment / event.
 */
export async function deleteAppointment(id: string): Promise<boolean> {
  try {
    const url = `${getCalendarBaseUrl()}/jmap/api`;
    await apiClient.post<any>(url, {
      using: ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:calendars'],
      methodCalls: [['CalendarEvent/set', { destroy: [id] }, 'del-event']],
    });
    return true;
  } catch {
    // CalDev unreachable, try /appointments fallback
  }

  try {
    await apiClient.delete(`/appointments/${id}`);
    return true;
  } catch (err) {
    console.warn(`Calendar deleteAppointment ${id} failed (server unreachable):`, err);
    return false;
  }
}

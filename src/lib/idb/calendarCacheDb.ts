import { IDB } from '@enjoys/react-api/idb';
import type { Table } from 'dexie';
import type { UserCalendar } from '@/lib/api/handlers/calendar';
import { getUserTimeZone } from '@/lib/timezoneUtils';

export interface CachedCalendarRecord extends UserCalendar {
  cachedAt: number;
}

export interface CachedCalendarSettingRecord {
  id: string;
  value: string;
  updatedAt: number;
}

export type CalendarDbTables = {
  calendars: Table<CachedCalendarRecord, string>;
  account_status: Table<any, string>;
  health: Table<any, string>;
  appointments: Table<any, string>;
  team_data: Table<any, string>;
  settings: Table<CachedCalendarSettingRecord, string>;
};

const schema: any = {
  calendars: 'id,ownerEmail,isDefault,cachedAt',
  account_status: 'email,hasCalendar,updatedAt',
  health: 'id,isHealthy,lastChecked',
  appointments: 'id,uid,calendarId,cachedAt',
  team_data: 'id,cachedAt',
  settings: 'id,updatedAt',
};

const DB_NAME = 'airsend-calendar-cache-v2';
let idbInstance: IDB<CalendarDbTables> | null = null;

function getIdb(): IDB<CalendarDbTables> | null {
  if (typeof window === 'undefined') return null;
  if (!idbInstance) {
    try {
      idbInstance = new IDB<CalendarDbTables>(schema as any, DB_NAME, 1);
    } catch (err) {
      console.warn('[CalendarIDB] Initialization failed:', err);
      return null;
    }
  }
  return idbInstance;
}

export async function withDb<T>(
  run: (db: ReturnType<IDB<CalendarDbTables>['getRawDb']>) => Promise<T>,
  fallback: T
): Promise<T> {
  const idb = getIdb();
  if (!idb) return fallback;
  try {
    return await run(idb.getRawDb());
  } catch (err) {
    console.warn('[CalendarIDB] Operation failed:', err);
    return fallback;
  }
}

// ──────────────── Cached User Calendars ────────────────

export async function getCachedCalendars(): Promise<UserCalendar[]> {
  return withDb(async (db) => {
    const records = await db.calendars.toArray();
    return records.map(({ cachedAt, ...cal }) => cal as UserCalendar);
  }, []);
}

export async function saveCachedCalendars(calendars: UserCalendar[]): Promise<void> {
  const now = Date.now();
  await withDb(async (db) => {
    await db.transaction('rw', db.calendars, async () => {
      await db.calendars.clear();
      const records: CachedCalendarRecord[] = calendars.map((cal) => ({
        ...cal,
        cachedAt: now,
      }));
      await db.calendars.bulkPut(records);
    });
  }, undefined);
}

// ──────────────── Cached Timezone & Settings ────────────────

export async function getCachedCalendarTimezone(): Promise<string> {
  return withDb(async (db) => {
    const setting = await db.settings.get('calendar_timezone');
    if (setting?.value) return setting.value;
    const detected = getUserTimeZone();
    await db.settings.put({
      id: 'calendar_timezone',
      value: detected,
      updatedAt: Date.now(),
    });
    return detected;
  }, getUserTimeZone());
}

export async function saveCachedCalendarTimezone(tz: string): Promise<void> {
  const cleanTz = tz.trim() || getUserTimeZone();
  await withDb(async (db) => {
    await db.settings.put({
      id: 'calendar_timezone',
      value: cleanTz,
      updatedAt: Date.now(),
    });
  }, undefined);
}

// Re-export sub-module IDB handlers
export {
  getCachedAccountCalendarStatus,
  saveAccountCalendarStatus,
  getAllCachedAccountStatuses,
  getCachedCalendarHealth,
  saveCachedCalendarHealth,
} from './calendarAccountStatusDb';
export type {
  CachedAccountCalendarStatus,
  CachedCalendarHealthRecord,
} from './calendarAccountStatusDb';

export {
  getCachedAppointments,
  saveCachedAppointments,
  getCachedTeamData,
  saveCachedTeamData,
} from './calendarAppointmentsDb';
export type {
  CachedAppointmentRecord,
  CachedTeamDataRecord,
} from './calendarAppointmentsDb';

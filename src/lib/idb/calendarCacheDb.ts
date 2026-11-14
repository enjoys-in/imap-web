import { IDB } from '@enjoys/react-api/idb';
import type { Table } from 'dexie';
import type { UserCalendar } from '@/lib/api/handlers/calendar';

export interface CachedCalendarRecord extends UserCalendar {
  cachedAt: number;
}

export interface CachedAccountCalendarStatus {
  email: string;
  hasCalendar: boolean;
  calendarId?: string;
  calendarName?: string;
  updatedAt: number;
}

export interface CachedCalendarHealthRecord {
  id: string;
  isHealthy: boolean;
  lastChecked: number;
  message?: string;
}

export type CalendarDbTables = {
  calendars: Table<CachedCalendarRecord, string>;
  account_status: Table<CachedAccountCalendarStatus, string>;
  health: Table<CachedCalendarHealthRecord, string>;
};

const schema: any = {
  calendars: 'id,ownerEmail,isDefault,cachedAt',
  account_status: 'email,hasCalendar,updatedAt',
  health: 'id,isHealthy,lastChecked',
};

const DB_NAME = 'airsend-calendar-cache-v1';

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

async function withDb<T>(
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

export async function getCachedAccountCalendarStatus(
  email: string
): Promise<CachedAccountCalendarStatus | null> {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  return withDb(async (db) => {
    return (await db.account_status.get(cleanEmail)) || null;
  }, null);
}

export async function saveAccountCalendarStatus(
  status: Omit<CachedAccountCalendarStatus, 'updatedAt'>
): Promise<void> {
  const cleanEmail = status.email.toLowerCase().trim();
  const record: CachedAccountCalendarStatus = {
    ...status,
    email: cleanEmail,
    updatedAt: Date.now(),
  };
  await withDb(async (db) => {
    await db.account_status.put(record);
  }, undefined);
}

export async function getAllCachedAccountStatuses(): Promise<CachedAccountCalendarStatus[]> {
  return withDb(async (db) => {
    return await db.account_status.toArray();
  }, []);
}

export async function getCachedCalendarHealth(): Promise<CachedCalendarHealthRecord | null> {
  return withDb(async (db) => {
    return (await db.health.get('health_status')) || null;
  }, null);
}

export async function saveCachedCalendarHealth(
  isHealthy: boolean,
  message?: string
): Promise<void> {
  const record: CachedCalendarHealthRecord = {
    id: 'health_status',
    isHealthy,
    lastChecked: Date.now(),
    message,
  };
  await withDb(async (db) => {
    await db.health.put(record);
  }, undefined);
}

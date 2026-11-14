import { IDB } from '@enjoys/react-api/idb';
import type { Table } from 'dexie';
import type {
  UserCalendar,
  SharedCalendar,
  TeammateAvailability,
  AvailabilitySharesResult,
} from '@/lib/api/handlers/calendar';
import type { Appointment } from '@/types';

export interface CachedCalendarRecord extends UserCalendar {
  cachedAt: number;
}

export interface CachedAppointmentRecord extends Appointment {
  cachedAt: number;
}

export interface CachedTeamDataRecord {
  id: string;
  shared_by_me: AvailabilitySharesResult['shared_by_me'];
  shared_with_me: AvailabilitySharesResult['shared_with_me'];
  org_visible: boolean;
  shared_calendars: SharedCalendar[];
  teammate_status: Record<string, TeammateAvailability>;
  cachedAt: number;
}

export interface CachedAccountCalendarStatus {
  email: string;
  hasCalendar: boolean;
  calendarId?: string;
  calendarName?: string;
  tenantId?: string;
  tenant_id?: string;
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
  appointments: Table<CachedAppointmentRecord, string>;
  team_data: Table<CachedTeamDataRecord, string>;
};

const schema: any = {
  calendars: 'id,ownerEmail,isDefault,cachedAt',
  account_status: 'email,hasCalendar,updatedAt',
  health: 'id,isHealthy,lastChecked',
  appointments: 'id,uid,calendarId,cachedAt',
  team_data: 'id,cachedAt',
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

// ──────────────── Cached Account Status ────────────────

export async function getCachedAccountCalendarStatus(
  email: string
): Promise<CachedAccountCalendarStatus | null> {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  return withDb(async (db) => {
    const record = await db.account_status.get(cleanEmail);
    if (!record) return null;
    if (record.tenant_id === '103' || (record as any).tenant_id === 103) {
      const domain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : 'example.com';
      record.tenant_id = domain;
      record.tenantId = domain;
      void db.account_status.put(record);
    }
    return record;
  }, null);
}

export async function saveAccountCalendarStatus(
  status: Omit<CachedAccountCalendarStatus, 'updatedAt'>
): Promise<void> {
  const cleanEmail = status.email.toLowerCase().trim();
  const domain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : 'example.com';
  const rawTenant = status.tenant_id || status.tenantId;
  const tenantId = (rawTenant === '103' || (rawTenant as any) === 103 || !rawTenant) ? domain : rawTenant;
  const record: CachedAccountCalendarStatus = {
    ...status,
    email: cleanEmail,
    tenantId,
    tenant_id: tenantId,
    updatedAt: Date.now(),
  };
  await withDb(async (db) => {
    await db.account_status.put(record);
  }, undefined);
}

export async function getAllCachedAccountStatuses(): Promise<CachedAccountCalendarStatus[]> {
  return withDb(async (db) => {
    const list = await db.account_status.toArray();
    for (const record of list) {
      if (record.tenant_id === '103' || (record as any).tenant_id === 103 || !record.tenant_id) {
        const domain = record.email.includes('@') ? record.email.split('@')[1] : 'example.com';
        record.tenant_id = domain;
        record.tenantId = domain;
        void db.account_status.put(record);
      }
    }
    return list;
  }, []);
}

// ──────────────── Cached Health Status ────────────────

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

// ──────────────── Cached Appointments (Events) ────────────────

export async function getCachedAppointments(): Promise<Appointment[]> {
  return withDb(async (db) => {
    const records = await db.appointments.toArray();
    return records.map(({ cachedAt, ...apt }) => apt as Appointment);
  }, []);
}

export async function saveCachedAppointments(appointments: Appointment[]): Promise<void> {
  const now = Date.now();
  await withDb(async (db) => {
    await db.transaction('rw', db.appointments, async () => {
      await db.appointments.clear();
      const records: CachedAppointmentRecord[] = appointments.map((apt) => ({
        ...apt,
        cachedAt: now,
      }));
      await db.appointments.bulkPut(records);
    });
  }, undefined);
}

// ──────────────── Cached Team Availability & Shares ────────────────

export async function getCachedTeamData(): Promise<CachedTeamDataRecord | null> {
  return withDb(async (db) => {
    return (await db.team_data.get('team-data')) || null;
  }, null);
}

export async function saveCachedTeamData(
  data: Omit<CachedTeamDataRecord, 'id' | 'cachedAt'>
): Promise<void> {
  const record: CachedTeamDataRecord = {
    id: 'team-data',
    ...data,
    cachedAt: Date.now(),
  };
  await withDb(async (db) => {
    await db.team_data.put(record);
  }, undefined);
}

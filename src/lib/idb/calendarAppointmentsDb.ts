import type { Appointment } from '@/types';
import type {
  SharedCalendar,
  TeammateAvailability,
  AvailabilitySharesResult,
} from '@/lib/api/handlers/calendar';
import { withDb } from './calendarCacheDb';

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

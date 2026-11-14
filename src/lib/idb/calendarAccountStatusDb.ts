import { withDb } from './calendarCacheDb';

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

function resolveTenant(email: string, rawTenant?: string): string {
  if (rawTenant === '103' || (rawTenant as any) === 103 || !rawTenant) {
    return email.includes('@') ? email.split('@')[1] : 'example.com';
  }
  return rawTenant;
}

export async function getCachedAccountCalendarStatus(
  email: string
): Promise<CachedAccountCalendarStatus | null> {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  return withDb(async (db) => {
    const record = await db.account_status.get(cleanEmail);
    if (!record) return null;
    const resolved = resolveTenant(cleanEmail, record.tenant_id || record.tenantId);
    if (record.tenant_id !== resolved || record.tenantId !== resolved) {
      record.tenant_id = resolved;
      record.tenantId = resolved;
      void db.account_status.put(record);
    }
    return record;
  }, null);
}

export async function saveAccountCalendarStatus(
  status: Omit<CachedAccountCalendarStatus, 'updatedAt'>
): Promise<void> {
  const cleanEmail = status.email.toLowerCase().trim();
  const tenantId = resolveTenant(cleanEmail, status.tenant_id || status.tenantId);
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
      const resolved = resolveTenant(record.email, record.tenant_id || record.tenantId);
      if (record.tenant_id !== resolved || record.tenantId !== resolved) {
        record.tenant_id = resolved;
        record.tenantId = resolved;
        void db.account_status.put(record);
      }
    }
    return list;
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

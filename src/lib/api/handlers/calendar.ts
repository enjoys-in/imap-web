import { apiClient } from '../client';
import { Appointment } from '@/types';

function unwrapList(res: any): Appointment[] {
  const list = Array.isArray(res?.result)
    ? res.result
    : Array.isArray(res)
    ? res
    : res?.result?.appointments;
  return Array.isArray(list) ? list : [];
}

/**
 * Fetch calendar appointments.
 */
export async function getAppointments(): Promise<Appointment[]> {
  const res = await apiClient.get<any>('/appointments');
  return unwrapList(res);
}

/**
 * Create a new calendar appointment.
 */
export async function createAppointment(data: Omit<Appointment, 'id'>): Promise<Appointment> {
  const res = await apiClient.post<any>('/appointments', data);
  return res?.result || res;
}

/**
 * Update an existing calendar appointment.
 */
export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
): Promise<Appointment> {
  const res = await apiClient.patch<any>(`/appointments/${id}`, data);
  return res?.result || res;
}

/**
 * Delete a calendar appointment.
 */
export async function deleteAppointment(id: string): Promise<boolean> {
  await apiClient.delete(`/appointments/${id}`);
  return true;
}

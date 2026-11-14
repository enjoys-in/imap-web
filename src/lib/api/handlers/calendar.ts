import { apiClient } from '../client';
import { Appointment } from '@/types';
import { MOCK_APPOINTMENTS } from '@/lib/mock';
import { isLiveApiAvailable } from '@/config/clientConfig';

/**
 * Fetch calendar appointments.
 */
export async function getAppointments(): Promise<Appointment[]> {
  if (!isLiveApiAvailable()) {
    return MOCK_APPOINTMENTS;
  }
  try {
    const res = await apiClient.get<any>('/appointments', {}, MOCK_APPOINTMENTS);
    const list = Array.isArray(res?.result)
      ? res.result
      : Array.isArray(res)
      ? res
      : Array.isArray(res?.result?.appointments)
      ? res.result.appointments
      : MOCK_APPOINTMENTS;
    return list;
  } catch {
    return MOCK_APPOINTMENTS;
  }
}

/**
 * Create a new calendar appointment.
 */
export async function createAppointment(data: Omit<Appointment, 'id'>): Promise<Appointment> {
  try {
    const res = await apiClient.post<any>('/appointments', data);
    return res?.result || { id: `apt-${Date.now()}`, ...data };
  } catch {
    return {
      id: `apt-${Date.now()}`,
      ...data,
    };
  }
}

/**
 * Update an existing calendar appointment.
 */
export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
): Promise<Appointment> {
  try {
    const res = await apiClient.patch<any>(`/appointments/${id}`, data);
    return res?.result || res;
  } catch {
    const existing = MOCK_APPOINTMENTS.find((a) => a.id === id) || MOCK_APPOINTMENTS[0];
    return { ...existing, ...data };
  }
}

/**
 * Delete a calendar appointment.
 */
export async function deleteAppointment(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/appointments/${id}`);
    return true;
  } catch {
    return true;
  }
}

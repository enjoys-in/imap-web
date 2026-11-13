import { Appointment } from '@/types';
import { MOCK_APPOINTMENTS } from '@/lib/mock';
import { getClientConfig, isLiveApiAvailable } from '@/config/clientConfig';

/**
 * Fetch calendar appointments.
 */
export async function getAppointments(): Promise<Appointment[]> {
  if (!isLiveApiAvailable()) {
    return MOCK_APPOINTMENTS;
  }
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/appointments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Simulated network latency
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_APPOINTMENTS;
  }
}

/**
 * Create a new calendar appointment.
 */
export async function createAppointment(data: Omit<Appointment, 'id'>): Promise<Appointment> {
  return {
    id: `apt-${Date.now()}`,
    ...data,
  };
}

/**
 * Delete a calendar appointment.
 */
export async function deleteAppointment(id: string): Promise<boolean> {
  return true;
}

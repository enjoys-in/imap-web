import { apiClient } from '../client';

export interface ImapJobInfo {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Dispatches an asynchronous IMAP background job.
 */
export async function dispatchJob(
  type: string,
  payload: Record<string, any> = {}
): Promise<{ jobId: string; type: string; status: string }> {
  const res = await apiClient.post<any>('/dispatch-job', { type, ...payload });
  return res?.result || res;
}

/**
 * Retrieves the status and progress of a background job.
 */
export async function getJobStatus(jobId: string): Promise<ImapJobInfo | null> {
  try {
    const res = await apiClient.get<any>(`/job-status?id=${encodeURIComponent(jobId)}`);
    return res?.result || res || null;
  } catch {
    return null;
  }
}

/**
 * Lists recent background jobs.
 */
export async function listJobs(limit = 50): Promise<ImapJobInfo[]> {
  try {
    const res = await apiClient.get<any>(`/job-list?limit=${limit}`);
    return res?.result || res || [];
  } catch {
    return [];
  }
}

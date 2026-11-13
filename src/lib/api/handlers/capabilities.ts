import { apiClient } from '../client';

export interface ServerCapabilityReport {
  raw: string[];
  features: {
    idle: boolean;
    quota: boolean;
    move: boolean;
    sort: boolean;
    thread: boolean;
    condstore: boolean;
    qresync: boolean;
    search: boolean;
    namespace: boolean;
    uidplus: boolean;
    enable: boolean;
    literalPlus: boolean;
  };
}

/**
 * Returns full capability report for the connected IMAP server.
 */
export async function getServerCapabilities(): Promise<ServerCapabilityReport | null> {
  try {
    const res = await apiClient.get<any>('/server-capabilities');
    return res?.result || res || null;
  } catch {
    return null;
  }
}

/**
 * Checks whether specific IMAP capabilities are supported.
 */
export async function checkCapability(
  capabilityOrCapabilities: string | string[]
): Promise<Record<string, boolean> | boolean> {
  try {
    const isArray = Array.isArray(capabilityOrCapabilities);
    const body = isArray
      ? { capabilities: capabilityOrCapabilities }
      : { capability: capabilityOrCapabilities };

    const res = await apiClient.post<any>('/check-capability', body);
    if (!isArray && res?.result?.supported !== undefined) {
      return res.result.supported;
    }
    return res?.result?.capabilities || {};
  } catch {
    return false;
  }
}

/**
 * Forces a re-read of server capabilities from the server.
 */
export async function refreshCapabilities(): Promise<ServerCapabilityReport | null> {
  try {
    const res = await apiClient.post<any>('/refresh-capabilities');
    return res?.result || res || null;
  } catch {
    return null;
  }
}

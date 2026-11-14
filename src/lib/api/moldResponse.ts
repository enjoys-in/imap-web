export interface ApiResponse<T = any> {
  message: string;
  result: T;
  success: boolean;
}

/**
 * Standardizes and molds backend responses into { message, result, success }.
 * Throws on success === false with backend error message.
 */
export function moldApiResponse<T = any>(
  raw: any,
  status = 200,
  statusText = 'OK'
): ApiResponse<T> & T {
  if (raw === null || raw === undefined) {
    return {
      message: statusText || 'OK',
      result: null as unknown as T,
      success: true,
    } as ApiResponse<T> & T;
  }

  if (typeof raw === 'object' && ('success' in raw || 'result' in raw)) {
    const isSuccess = raw.success !== undefined ? Boolean(raw.success) : status >= 200 && status < 300;
    const msg = typeof raw.message === 'string' ? raw.message : (isSuccess ? 'Success' : statusText);

    if (!isSuccess) {
      throw new Error(msg || 'API request failed');
    }

    const result = ('result' in raw ? raw.result : ('data' in raw ? raw.data : raw)) as T;

    const envelope: any = {
      message: msg,
      result,
      success: true,
    };

    if (result && typeof result === 'object' && !Array.isArray(result)) {
      Object.assign(envelope, result);
    }

    return envelope;
  }

  const envelope: any = {
    message: statusText || 'Success',
    result: raw as T,
    success: true,
  };

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    Object.assign(envelope, raw);
  }

  return envelope;
}

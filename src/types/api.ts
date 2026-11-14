/**
 * Standard backend response envelope structure:
 * {
 *   "message": string,
 *   "result": any,
 *   "success": boolean
 * }
 * (except Server-Sent Event stream endpoints)
 */
export interface ApiResponse<T = any> {
  message: string;
  result: T;
  success: boolean;
}

/* ─── API response shapes ─── */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

export interface ApiError {
  error: string;
  statusCode: number;
}

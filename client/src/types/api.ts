// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
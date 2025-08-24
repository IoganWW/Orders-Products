// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface ApiError extends Error {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

// Фабричная функция для создания ApiError
export const createApiError = (
  message: string, 
  status?: number, 
  code?: string, 
  details?: Record<string, any>
): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
};

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Конфигурация запросов
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  withCredentials?: boolean;
}
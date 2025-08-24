// client/src/services/api.ts
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store';
import { ApiResponse, ApiError, createApiError  } from '@/types/api';
import { User } from '@/types/users';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

// Типизированный интерфейс для store
interface StoreType {
  getState: () => {
    auth: {
      token: string | null;
      user: User | null;
      isAuthenticated: boolean;
    };
  };
}


// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_URL,
});

// Флаг для предотвращения множественных уведомлений
let isLogoutInProgress = false;

// Request interceptor для автоматического добавления токена
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Получаем токен из localStorage или Redux store
    let token: string | null = null;
    
    try {
      // Сначала пытаемся получить токен из Redux store
      if (store && typeof store.getState === 'function') {
        const state = (store as StoreType).getState();
        if (state?.auth?.token) {
          token = state.auth.token;
        }
      }
  
      // Fallback к localStorage, если токена нет в store
      if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }
    } catch (error) {
      console.warn('Error accessing store:', error);
  
      // Если произошла ошибка со store, все равно пытаемся получить из localStorage
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }
    }

    // Добавляем токен в заголовки
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor для автоматической обработки ответов
api.interceptors.response.use(
  <T = any>(response: AxiosResponse<ApiResponse<T> | T>): AxiosResponse<T> => {
    // Если ответ имеет структуру ApiResponse {success, data}, извлекаем data
    if (response.data && 
        typeof response.data === 'object' && 
        'success' in response.data) {
      
      const apiResponse = response.data as ApiResponse<T>;
      
      if (apiResponse.success) {
        // Возвращаем только data для успешных ответов
        return {
          ...response,
          data: apiResponse.data
        } as AxiosResponse<T>;
      } else {
        throw createApiError(
          apiResponse.error || apiResponse.message || 'API request failed',
    response.status
        );
      }
    }
    
    // Если старый формат, возвращаем как есть
    return response as AxiosResponse<T>;
  },
  (error) => {
    // Типизированная обработка 401/403 ошибок авторизации
    if (error.response && 
        (error.response.status === 401 || error.response.status === 403) &&
        !isLogoutInProgress) {
      
      // Устанавливаем флаг, что logout в процессе
      isLogoutInProgress = true;
      
      console.log('Authentication failed, logging out...');
      
      // Проверяем, был ли пользователь авторизован (есть ли токен в localStorage)
      const hadToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      // Очищаем localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Уведомляем пользователя ТОЛЬКО если у него был токен (т.е. он был авторизован)
      if (hadToken && typeof window !== 'undefined') {
        const errorEvent = new CustomEvent('showNotification', {
          detail: { 
            type: 'error', 
            message: 'Сессия истекла. Войдите в систему заново.' ,
            duration: 5000
          }
        });
        window.dispatchEvent(errorEvent);
      }
      
      // Сбрасываем флаг через небольшой тайм-аут, чтобы избежать спама
      setTimeout(() => {
        isLogoutInProgress = false;
      }, 2000);
    }
    
    // Создаем типизированную ошибку
    if (error.response?.data?.error) {
      throw createApiError(
    error.response.data.error,
    error.response.status
      );
    }

    // Общая обработка ошибок с типизацией
    throw createApiError(
  error.message || 'Network error occurred',
  error.response?.status
    );
  }
);

// Типизированные методы API
interface TypedAxiosInstance {
  get<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>>;
}

export default api as TypedAxiosInstance;
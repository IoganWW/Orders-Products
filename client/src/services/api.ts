// client/src/services/api.ts
import axios from 'axios';
import { store } from '@/store';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_URL,
});

// Флаг для предотвращения множественных уведомлений
let isLogoutInProgress = false;

// Request interceptor для автоматического добавления токена
api.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage или Redux store
    let token = null;
    
    // Пытаемся получить из Redux store
    const state = store.getState();
    if (state.auth.token) {
      token = state.auth.token;
    } 
    // Если нет в store, пытаемся получить из localStorage
    else if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    // Добавляем токен в заголовки если он есть
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для автоматической обработки ответов
api.interceptors.response.use(
  (response) => {
    // Если ответ имеет структуру {success, data}, извлекаем data
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (response.data.success) {
        // Заменяем response.data на response.data.data
        return {
          ...response,
          data: response.data.data
        };
      } else {
        // Если success: false, бросаем ошибку
        const error = new Error(response.data.error || 'API request failed');
        error.status = response.status;
        throw error;
      }
    }
    
    // Если старый формат, возвращаем как есть
    return response;
  },
  (error) => {
    // Обработка 401/403 ошибок авторизации
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
      if (hadToken) {
        const errorEvent = new CustomEvent('showNotification', {
          detail: { 
            type: 'error', 
            message: 'Сессия истекла. Войдите в систему заново.' 
          }
        });
        window.dispatchEvent(errorEvent);
      }
      
      // Сбрасываем флаг через небольшой тайм-аут, чтобы избежать спама
      setTimeout(() => {
        isLogoutInProgress = false;
      }, 2000);

      // Обновляем состояние Redux только если пользователь был авторизован
      if (hadToken) {
        // Можно также отправить action для обновления состояния Redux
        // store.dispatch(logoutUser());
      }
    }
    
    // Обработка ошибок с новым форматом
    if (error.response?.data?.error) {
      const apiError = new Error(error.response.data.error);
      apiError.status = error.response.status;
      throw apiError;
    }
    
    throw error;
  }
);

export default api;
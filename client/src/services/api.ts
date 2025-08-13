// client/src/services/api.ts
import axios from 'axios';
import { store } from '@/store';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_URL,
});

// Добавляем interceptor для автоматического добавления токена
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

// Interceptor для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если получили 401 или 403 ошибку - токен недействителен
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Очищаем localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Уведомляем пользователя
      const errorEvent = new CustomEvent('showNotification', {
        detail: { 
          type: 'error', 
          message: 'Сессия истекла. Войдите в систему заново.' 
        }
      });
      window.dispatchEvent(errorEvent);
      
      // Можно также отправить action для обновления состояния Redux
      // store.dispatch(logoutUser());
    }
    
    return Promise.reject(error);
  }
);

export default api;
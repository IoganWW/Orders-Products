'use client';

import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Notifications, { showNotification } from '@/components/UI/Notifications';
import { useSocket } from '@/hooks/useSocket';
import { useAppDispatch, useAppSelector  } from '@/store';
import { initializeAuth, logoutUser  } from '@/store/slices/authSlice';
import styles from './Layout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector(state => state.auth);

  useSocket(); // Подключаем Socket.io

  // Инициализируем авторизацию при загрузке
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // useEffect для проверки синхронизации токена
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let storageListener: ((e: StorageEvent) => void) | null = null;

    // Функция проверки синхронизации
    const checkTokenSync = () => {
      const storageToken = localStorage.getItem('token');
      
      // Если в Redux есть авторизация, но токена в localStorage нет
      if (isAuthenticated && token && !storageToken) {
        console.warn('🚨 Token manually removed from localStorage - forcing logout');
        
        dispatch(logoutUser());
        
        // Показываем предупреждение
        showNotification({
          type: 'warning',
          message: 'Сессия была завершена принудительно',
          duration: 4000
        });
      }
      
      // Если в localStorage есть токен, но Redux показывает неавторизованность
      if (!isAuthenticated && storageToken) {
        console.warn('🚨 Inconsistent state detected - clearing localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    // Слушатель изменений localStorage (работает между вкладками)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.oldValue && !e.newValue) {
        console.warn('🚨 Token removed from localStorage in another tab');
        
        if (isAuthenticated) {
          dispatch(logoutUser());
          
          showNotification({
            type: 'warning',
            message: 'Сессия завершена в другой вкладке',
            duration: 4000
          });
        }
      }
    };

    // Проверка при фокусе на окне
    const handleWindowFocus = () => {
      checkTokenSync();
    };

    // Запускаем только если пользователь авторизован
    if (isAuthenticated) {
      // Периодическая проверка каждые 3 секунды
      interval = setInterval(checkTokenSync, 3000);
      
      // Слушаем изменения localStorage
      storageListener = handleStorageChange;
      window.addEventListener('storage', storageListener);
      
      // Проверяем при возвращении фокуса на вкладку
      window.addEventListener('focus', handleWindowFocus);
    }

    // Очистка при размонтировании или изменении авторизации
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (storageListener) {
        window.removeEventListener('storage', storageListener);
      }
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isAuthenticated, token, dispatch]); // Зависимости

  return (
    <div className={`${styles.layout} layout`}>
      <Header />
      <div className={`${styles.layoutBody} layout-body`}>
        <Sidebar />
        <main className={`${styles.layoutMain} layout-main`}>
          {children}
        </main>
      </div>
      <Notifications />
    </div>
  );
};

export default MainLayout;
'use client';

import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Notifications from '@/components/UI/Notifications';
import { useSocket } from '@/hooks/useSocket';
import { useAppDispatch } from '@/store';
import { initializeAuth } from '@/store/slices/authSlice';
import styles from './Layout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useSocket(); // Подключаем Socket.io

  // Инициализируем авторизацию при загрузке
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

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
'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useSocket } from '@/hooks/useSocket';
import styles from './Layout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  useSocket(); // Подключаем Socket.io

  return (
    <div className={`${styles.layout} layout`}>
      <Header />
      <div className={`${styles.layoutBody} layout-body`}>
        <Sidebar />
        <main className={`${styles.layoutMain} layout-main`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
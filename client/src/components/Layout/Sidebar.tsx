// client/src/components/Layout/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import AuthModal from '@/components/Auth/AuthModal';
import styles from './Layout.module.css';
import authStyles from '@/components/Auth/Auth.module.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector(state => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const menuItems = [
    {
      href: '/orders',
      label: 'ПРИХОД',
      icon: 'fas fa-arrow-down',
      isActive: pathname === '/orders'
    },
    {
      href: '/groups',
      label: 'ГРУППЫ',
      icon: 'fas fa-layer-group',
      isActive: pathname === '/groups'
    },
    {
      href: '/products',
      label: 'ПРОДУКТЫ',
      icon: 'fas fa-box',
      isActive: pathname === '/products'
    },
    {
      href: '/users',
      label: 'ПОЛЬЗОВАТЕЛИ',
      icon: 'fas fa-users',
      isActive: pathname === '/users'
    },
    {
      href: '/settings',
      label: 'НАСТРОЙКИ',
      icon: 'fas fa-cog',
      isActive: pathname === '/settings'
    }
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      
      // Редирект на главную страницу
      router.push('/');
      
      const successEvent = new CustomEvent('showNotification', {
        detail: { type: 'success', message: 'Вы успешно вышли из системы' }
      });
      window.dispatchEvent(successEvent);
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2);
  };

  return (
    <>
      <aside className={`${styles.sidebar} sidebar`}>
        {/* Блок авторизации */}
        <div className={`${styles.sidebarAuth} sidebar-auth justify-content-center`}>
          {loading ? (
            <div className={authStyles.loading}>
              <span className="spinner-border spinner-border-sm me-2" />
              Loading...
            </div>
          ) : isAuthenticated && user ? (
            <div className={`${authStyles.userInfo} user-info`}>
              <div className={`${authStyles.userAvatar} user-avatar`}>
                {getInitials(user.name)}
              </div>
              <div className={`${authStyles.userDetails} user-details`}>
                <p className={`${authStyles.userName} user-name`}>
                  {user.name}
                </p>
                <p className={`${authStyles.userEmail} user-email`}>
                  {user.email}
                </p>
              </div>
              <button
                className={`${authStyles.logoutBtn} logout-btn`}
                onClick={handleLogout}
                title="Выйти"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          ) : (
            <button
              className={`${authStyles.loginBtn} login-btn`}
              onClick={() => setShowAuthModal(true)}
            >
              <i className="fas fa-sign-in-alt"></i>
              Войти
            </button>
          )}
        </div>

        {/* Навигационное меню */}
        <nav className={`${styles.sidebarNav} sidebar-nav`}>
          <ul className={`${styles.navList} nav-list`}>
            {menuItems.map((item) => (
              <li key={item.href} className={`${styles.navItem} nav-item`}>
                <Link
                  href={item.href}
                  className={`
                    ${styles.navLink} 
                    nav-link
                    ${item.isActive ? styles.active : ''}
                  `}
                >
                  <i className={`${item.icon} ${styles.navIcon} d-block d-md-none`}></i>
                  <span className={`${styles.navLabel} nav-label`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Модалка авторизации */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Sidebar;
// client/src/components/Layout/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import AuthModal from '@/components/Auth/AuthModal';
import styles from './Layout.module.css';
import authStyles from '@/components/Auth/Auth.module.css';

const Sidebar: React.FC = () => {
  const { t } = useTranslation(['navigation', 'common']);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector(state => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  const menuItems = [
    {
      href: '/orders',
      label: t('navigation:orders').toLocaleUpperCase(),
      icon: 'fas fa-arrow-down',
      isActive: pathname === '/orders'
    },
    {
      href: '/groups',
      label: t('navigation:groups').toLocaleUpperCase(),
      icon: 'fas fa-layer-group',
      isActive: pathname === '/groups'
    },
    {
      href: '/products',
      label: t('navigation:products').toLocaleUpperCase(),
      icon: 'fas fa-box',
      isActive: pathname === '/products'
    },
    {
      href: '/users',
      label: t('navigation:users').toLocaleUpperCase(),
      icon: 'fas fa-users',
      isActive: pathname === '/users'
    },
    {
      href: '/settings',
      label: t('navigation:settings').toLocaleUpperCase(),
      icon: 'fas fa-cog',
      isActive: pathname === '/settings'
    }
  ];

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/');
      const successEvent = new CustomEvent('showNotification', {
        detail: { type: 'success', message: `${t('common:successLogout')}` }
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
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <aside className={`${styles.sidebar}`}>
        {/* Updated Authorization Block */}
        <div className={`${styles.sidebarAuth} px-0 px-lg-2 mt-3`}>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <span className="spinner-border spinner-border-sm" />
            </div>
          ) : isAuthenticated && user ? (
            <div className={`${authStyles.userProfile} position-relative`}>
              <div className={`${authStyles.userAvatarWrapper}`}>
                <div className={`${authStyles.userAvatar} shadow-sm`}>
                  {/* user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{getInitials(user.name)}</span> */}
                  <span>{getInitials(user.name)}</span>
                </div>
                <button
                  className={`${authStyles.settingsBtn} settings-btn btn btn-light btn-sm rounded-circle shadow-sm`}
                  onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                  title={t('common:profileSettings')}
                >
                  <i className="fas fa-cog"></i>
                </button>
                <button
                  className={`
                    ${authStyles.logoutBtn} 
                    logout-btn btn btn-danger btn-sm rounded-circle shadow-sm
                    ${isProfileMenuOpen ? authStyles.show : ''}
                  `}
                  onClick={handleLogout}
                  title={t('common:logout')}
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
              <div className="text-center mt-2">
                <p className={`${authStyles.userName} mb-0`}>
                  {user.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <button
                className={`${authStyles.loginBtn} login-btn btn btn-success`}
                onClick={() => setShowAuthModal(true)}
              >
                <i className="fas fa-sign-in-alt ms-0 me-2"></i>
                <span className="d-none d-md-inline">{t('common:login')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className={`${styles.sidebarNav}`}>
          <ul className={`${styles.navList}`}>
            {menuItems.map((item) => (
              <li key={item.href} className={`${styles.navItem}`}>
                <Link
                  href={item.href}
                  className={`
                    ${styles.navLink} 
                    nav-link
                    ${item.isActive ? styles.active : ''}
                  `}
                >
                  <i className={`${item.icon} ${styles.navIcon}`}></i>
                  <span className={`${styles.navLabel}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Auth Modal */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Sidebar;
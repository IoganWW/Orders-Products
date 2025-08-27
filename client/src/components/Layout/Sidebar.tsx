// client/src/components/Layout/Sidebar.tsx
'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';
import { showNotification } from '@/components/UI/Notifications';
import { NAVIGATION_ITEMS } from '@/constants/navigation';
import AuthModal from '@/components/Auth/AuthModal';
import styles from './Layout.module.css';
import authStyles from '@/components/Auth/Auth.module.css';


const Sidebar: React.FC = memo(() => {
  const { t } = useTypedTranslation(['navigation', 'common']);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector(state => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  // Мемоизируем создание пунктов меню из импортированных констант
  const menuItems = useMemo(() => {
    return NAVIGATION_ITEMS.map(item => ({
      href: item.href,
      label: t(`navigation:${item.labelKey}`).toLocaleUpperCase(),
      icon: item.icon,
      isActive: pathname === item.href
    }));
  }, [t, pathname]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/');
      showNotification({
        type: 'success',
        message: t('common:successLogout'),
        duration: 4000
      });
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

  // Мемоизируем обработчики модального окна
  const handleShowAuth = useCallback(() => setShowAuthModal(true), []);
  const handleCloseAuth = useCallback(() => setShowAuthModal(false), []);
  const handleToggleProfile = useCallback(() => setProfileMenuOpen(!isProfileMenuOpen), [isProfileMenuOpen]);

  return (
    <>
      <aside className={`${styles.sidebar}`}>
        {/* Authorization Block */}
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
                  onClick={handleToggleProfile}
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
                onClick={handleShowAuth}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                <span className="d-none d-md-inline">{t('common:login')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="py-3">
          <ul className="list-unstyled m-0 p-0">
            {menuItems.map((item) => (
              <li key={item.href} className="position-relative mb-2 ms-1">
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${item.isActive ? styles.active : ''}`}
                  aria-label={item.label}
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
        onClose={handleCloseAuth}
      />
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
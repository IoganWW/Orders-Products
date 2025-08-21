// client/src/components/Auth/AuthWrapper.tsx
'use client';

import React from 'react';
import { useAppSelector } from '@/store';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, fallback }) => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="d-flex justify-content-center align-items-center h-100 p-4">
        <div className="text-center">
          <i className="fas fa-lock fa-4x text-muted mb-4"></i>
          <h4 className="text-muted mb-3">Требуется авторизация</h4>
          <p className="text-muted mb-4">
            Для доступа к этой странице необходимо войти в систему
          </p>
          <p className="text-muted small">
            Используйте кнопку Войти в боковом меню
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
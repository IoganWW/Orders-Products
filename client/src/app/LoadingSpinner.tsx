'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Компонент загрузки
const LoadingSpinner: React.FC = React.memo(() => {
  const { t } = useTranslation(['common']);
  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4 px-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">{t('common:loading')}</span>
          </div>
        </div>
      </div>
    </div>
  )
});

LoadingSpinner.displayName = 'LoadingSpinner';
export default LoadingSpinner; 
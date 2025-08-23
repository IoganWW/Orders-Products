'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Компонент ошибки
const ErrorMessage: React.FC<{ error: string }> = React.memo(({ error }) => {
  const { t } = useTranslation(['common']);
  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4 px-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">{t('common:error')}</h4>
          <p>{error}</p>
        </div>
      </div>
    </div>
  )
});

ErrorMessage.displayName = 'ErrorMessage';
export default ErrorMessage;
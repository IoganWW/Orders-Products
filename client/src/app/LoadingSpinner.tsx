'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';

// === Большой спиннер (полноэкранный) ===
interface LoadingSpinnerProps {
  message?: string;
  variant?: 'primary' | 'success' | 'secondary';
}

const LoadingSpinnerComponent: React.FC<LoadingSpinnerProps> = ({ 
  message, 
  variant = 'success'
}) => {
  const { t } = useTranslation(['common']);

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4 px-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className={`spinner-border text-${variant}`} role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">{message || t('common:loading')}</span>
          </div>
        </div>
      </div>
    </div>
  )
};

const LoadingSpinner = React.memo(LoadingSpinnerComponent);
LoadingSpinner.displayName = 'LoadingSpinner';


// === Маленький спиннер (для кнопок/inline) ===
interface InlineSpinnerProps {
  variant?: 'primary' | 'success' | 'secondary';
}

const InlineSpinnerComponent: React.FC<InlineSpinnerProps> = ({ variant = 'primary' }) => (
  <div className={`spinner-border spinner-border-sm text-${variant}`} role="status">
    <span className="visually-hidden">Loading...</span>
  </div>
);

const InlineSpinner = React.memo(InlineSpinnerComponent);
InlineSpinner.displayName = 'InlineSpinner';

export { LoadingSpinner, InlineSpinner };

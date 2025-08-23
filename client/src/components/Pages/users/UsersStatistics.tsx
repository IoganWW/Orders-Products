'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserStatistics } from '@/types/users';

// Компонент статистики пользователей
const UsersStatistics: React.FC<{ statistics: UserStatistics }> = React.memo(({
  statistics
}) => {
  const { t } = useTranslation(['users']);
  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="d-flex flex-wrap gap-3 justify-content-start">
          <div className="bg-white rounded px-3 py-2 border">
            <span className="text-muted small me-2">{t('users:totalUsers')}:</span>
            <span className="fw-bold">{statistics.totalUsers}</span>
          </div>

          <div className="bg-white rounded px-3 py-2 border">
            <span className="text-muted small me-2">{t('users:admins')}:</span>
            <span className="fw-bold">{statistics.adminUsers}</span>
          </div>

          <div className="bg-white rounded px-3 py-2 border">
            <span className="text-muted small me-2">{t('users:managers')}:</span>
            <span className="fw-bold">{statistics.managerUsers}</span>
          </div>

          <div className="bg-white rounded px-3 py-2 border">
            <button className="btn btn-sm btn-success border-0">
              <i className="fas fa-plus me-1"></i>
              {t('users:addUser')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
});

UsersStatistics.displayName = 'UsersStatistics';
export default UsersStatistics;
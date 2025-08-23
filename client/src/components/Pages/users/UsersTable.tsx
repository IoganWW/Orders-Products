'use client';
import React from 'react';
import { User } from '@/types/users';
import UserTableRow from './UserTableRow';
import { useTranslation } from 'react-i18next';

// Компонент таблицы пользователей
const UsersTable: React.FC<{
  users: User[],
  onEdit: (userId: number) => void,
  onSettings: (userId: number) => void,
  onDelete: (userId: number) => void
}> = React.memo(({ users, onEdit, onSettings, onDelete }) => {
  const { t } = useTranslation(['users', 'common']);

  if (users.length === 0) {
    return (
      <div className="bg-white rounded border">
        <div className="text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">{t('users:notFound')}</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="border-0 px-4 py-3">
                <span className="text-muted small fw-bold">{t('users:user')}</span>
              </th>
              <th className="border-0 px-4 py-3">
                <span className="text-muted small fw-bold">{t('common:role')}</span>
              </th>
              <th className="border-0 px-4 py-3">
                <span className="text-muted small fw-bold">{t('users:registration')}</span>
              </th>
              <th className="border-0 px-4 py-3">
                <span className="text-muted small fw-bold">{t('users:lastUpdate')}</span>
              </th>
              <th className="border-0 px-4 py-3 text-end">
                <span className="text-muted small fw-bold">{t('common:actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onEdit={onEdit}
                onSettings={onSettings}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

UsersTable.displayName = 'UsersTable';
export default UsersTable;
// client/src/app/users/page.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import {
  User,
  UserStatistics,
  calculateUserStatistics,
  getRoleLabel,
  getRoleColor
} from '@/types/users';
import { fetchUsers } from '@/services/api';
import { formatDate } from '@/utils/dateUtils';

// Компонент статистики пользователей
const UsersStatistics: React.FC<{ statistics: UserStatistics }> = React.memo(({
  statistics
}) => (
  <div className="row mb-4">
    <div className="col-12">
      <div className="d-flex flex-wrap gap-3 justify-content-start">
        <div className="bg-white rounded px-3 py-2 border">
          <span className="text-muted small me-2">Всего пользователей:</span>
          <span className="fw-bold">{statistics.totalUsers}</span>
        </div>

        <div className="bg-white rounded px-3 py-2 border">
          <span className="text-muted small me-2">Администраторы:</span>
          <span className="fw-bold">{statistics.adminUsers}</span>
        </div>

        <div className="bg-white rounded px-3 py-2 border">
          <span className="text-muted small me-2">Менеджеры:</span>
          <span className="fw-bold">{statistics.managerUsers}</span>
        </div>

        <div className="bg-white rounded px-3 py-2 border">
          <button className="btn btn-sm btn-success border-0">
            <i className="fas fa-plus me-1"></i>
            Добавить пользователя
          </button>
        </div>
      </div>
    </div>
  </div>
));

UsersStatistics.displayName = 'UsersStatistics';

// Компонент строки пользователя
const UserTableRow: React.FC<{
  user: User,
  onEdit: (userId: number) => void,
  onSettings: (userId: number) => void,
  onDelete: (userId: number) => void
}> = React.memo(({ user, onEdit, onSettings, onDelete }) => {
  const createdDate = useMemo(() => formatDate(user.created_at), [user.created_at]);
  const updatedDate = useMemo(() => formatDate(user.updated_at), [user.updated_at]);

  return (
    <tr className="border-bottom">
      <td className="px-4 py-3">
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#f8f9fa',
              border: '2px solid #e9ecef'
            }}
          >
            <i className="fas fa-user text-muted"></i>
          </div>
          <div>
            <div className="fw-medium text-dark">{user.name}</div>
            <div className="text-muted small">{user.email}</div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className={`badge ${getRoleColor(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="text-dark small">{createdDate.short}</div>
        <div className="text-muted small">{createdDate.long}</div>
      </td>

      <td className="px-4 py-3">
        <div className="text-dark small">{updatedDate.short}</div>
        <div className="text-muted small">{updatedDate.long}</div>
      </td>

      <td className="px-4 py-3 text-end">
        <div className="d-flex gap-1 justify-content-end">
          <button
            className="btn btn-sm btn-outline-primary border-0"
            title="Редактировать"
            onClick={() => onEdit(user.id)}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary border-0"
            title="Настройки"
            onClick={() => onSettings(user.id)}
          >
            <i className="fas fa-cog"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger border-0"
            title="Удалить"
            onClick={() => onDelete(user.id)}
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  );
});

UserTableRow.displayName = 'UserTableRow';

// Компонент таблицы пользователей
const UsersTable: React.FC<{
  users: User[],
  onEdit: (userId: number) => void,
  onSettings: (userId: number) => void,
  onDelete: (userId: number) => void
}> = React.memo(({ users, onEdit, onSettings, onDelete }) => {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded border">
        <div className="text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">Пользователи не найдены</h5>
          <p className="text-muted small">В системе пока нет зарегистрированных пользователей</p>
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
                <span className="text-muted small fw-bold">ПОЛЬЗОВАТЕЛЬ</span>
              </th>
              <th className="border-0 px-4 py-3">
                <span className="text-muted small fw-bold">РОЛЬ</span>
              </th>
              <th className="border-0 px-4 py-3">
                <span className="text-muted small fw-bold">РЕГИСТРАЦИЯ</span>
              </th>
              <th className="border-0 px-4 py-3">
                <span className="text-muted small fw-bold">ПОСЛЕДНЕЕ ОБНОВЛЕНИЕ</span>
              </th>
              <th className="border-0 px-4 py-3 text-end">
                <span className="text-muted small fw-bold">ДЕЙСТВИЯ</span>
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

// Компонент загрузки
const LoadingSpinner: React.FC = React.memo(() => (
  <div className="bg-light min-vh-100">
    <div className="container-fluid py-4 px-5">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Компонент ошибки
const ErrorMessage: React.FC<{ error: string }> = React.memo(({ error }) => (
  <div className="bg-light min-vh-100">
    <div className="container-fluid py-4 px-5">
      <div className="alert alert-danger">
        <h4 className="alert-heading">Ошибка!</h4>
        <p>{error}</p>
      </div>
    </div>
  </div>
));

ErrorMessage.displayName = 'ErrorMessage';

// Основной компонент
function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Мемоизированная статистика
  const statistics = useMemo(() => calculateUserStatistics(users), [users]);

  // Загрузка пользователей
  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Ошибка загрузки пользователей');
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  // Обработчики действий
  const handleEdit = useCallback((userId: number) => {
    console.log('Edit user:', userId);
    // Здесь будет логика редактирования
  }, []);

  const handleSettings = useCallback((userId: number) => {
    console.log('Settings for user:', userId);
    // Здесь будет логика настроек
  }, []);

  const handleDelete = useCallback((userId: number) => {
    console.log('Delete user:', userId);
    // Здесь будет логика удаления
  }, []);

  // Состояния загрузки и ошибок
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4 px-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3 fw-bold text-dark mb-1">Пользователи системы</h1>
            <p className="text-muted mb-0 small">Управление пользователями и их правами доступа</p>
          </div>
        </div>

        {/* Statistics */}
        <UsersStatistics statistics={statistics} />

        {/* Users Table */}
        <div className="row">
          <div className="col-12">
            <UsersTable
              users={users}
              onEdit={handleEdit}
              onSettings={handleSettings}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AuthWrapper>
      <UsersPageContent />
    </AuthWrapper>
  );
}
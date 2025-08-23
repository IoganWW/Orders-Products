// client/src/app/users/page.tsx
'use client';

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import DeleteUserModal from '@/components/Users/DeleteUserModal';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUsers, deleteUser } from '@/store/slices/usersSlice';
import { User, calculateUserStatistics } from '@/types/users';
import { useTranslation } from 'react-i18next';

import UsersStatistics from '@/components/Pages/users/UsersStatistics';
import UsersTable from '@/components/Pages/users/UsersTable';
import LoadingSpinner from '@/app/LoadingSpinner';
import ErrorMessage from '@/app/ErrorMessage';


// Основной компонент
export default function UsersPageContent() {
  const { t } = useTranslation(['users']);
  const dispatch = useAppDispatch();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Получаем данные из Redux store
  const { users, loading, error, deleting } = useAppSelector(state => state.users);

  // Мемоизированная статистика
  const statistics = useMemo(() => calculateUserStatistics(users), [users]);

  // Загрузка пользователей
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

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
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
  }, [users]);

  const handleConfirmDelete = useCallback(async () => {
    if (userToDelete) {
      await dispatch(deleteUser(userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  }, [dispatch, userToDelete]);

  const handleCloseModal = useCallback(() => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  }, []);

  // Состояния загрузки и ошибок
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="page fade-in">
      <div className="bg-light min-vh-100">
        <div className="container-fluid py-5 px-3 px-lg-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <h1 className="h3 fw-bold text-dark mb-1">{t('users:title')}</h1>
              <p className="text-muted mb-0 small">{t('users:subtitle')}</p>
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

          {showDeleteModal && userToDelete && (
            <DeleteUserModal
              show={showDeleteModal}
              user={userToDelete}
              onClose={handleCloseModal}
              onConfirm={handleConfirmDelete}
              isDeleting={deleting}
            />
          )}
        </div>
      </div>
    </div>
  );
}
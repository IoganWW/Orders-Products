// client/src/app/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/types/users';
import { fetchUsers } from '@/services/api';
import { formatDate } from '@/utils/dateUtils';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true);
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

  const getRoleLabel = (role: string) => {
    const roleConfig: { [key: string]: string } = {
      admin: 'Администратор',
      manager: 'Менеджер',
      user: 'Пользователь'
    };
    return roleConfig[role] || role;
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <div className="container-fluid py-4 px-5">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-light min-vh-100">
        <div className="container-fluid py-4 px-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Ошибка!</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-3 justify-content-start">
              <div className="bg-white rounded px-3 py-2 border">
                <span className="text-muted small me-2">Всего пользователей:</span>
                <span className="fw-bold">{users.length}</span>
              </div>
              
              <div className="bg-white rounded px-3 py-2 border">
                <span className="text-muted small me-2">Администраторы:</span>
                <span className="fw-bold">{users.filter(u => u.role === 'admin').length}</span>
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

        {/* Users Table */}
        <div className="row">
          <div className="col-12">
            <div className="bg-white rounded border">
              {users.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Пользователи не найдены</h5>
                  <p className="text-muted small">В системе пока нет зарегистрированных пользователей</p>
                </div>
              ) : (
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
                        <tr key={user.id} className="border-bottom">
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
                            <span className="badge bg-light text-dark border">
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="text-dark small">{formatDate(user.created_at).short}</div>
                            <div className="text-muted small">{formatDate(user.created_at).long}</div>
                          </td>
                          
                          <td className="px-4 py-3">
                            <div className="text-dark small">{formatDate(user.updated_at).short}</div>
                            <div className="text-muted small">{formatDate(user.updated_at).long}</div>
                          </td>
                          
                          <td className="px-4 py-3 text-end">
                            <div className="d-flex gap-1 justify-content-end">
                              <button 
                                className="btn btn-sm btn-outline-primary border-0"
                                title="Редактировать"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary border-0"
                                title="Настройки"
                              >
                                <i className="fas fa-cog"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger border-0"
                                title="Удалить"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
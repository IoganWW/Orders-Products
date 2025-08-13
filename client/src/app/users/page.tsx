// client/src/app/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
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

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'danger', icon: 'crown', label: 'Администратор' },
      manager: { color: 'warning', icon: 'user-tie', label: 'Менеджер' },
      user: { color: 'primary', icon: 'user', label: 'Пользователь' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    
    return (
      <span className={`badge bg-${config.color} d-flex align-items-center gap-1`}>
        <i className={`fas fa-${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <AuthWrapper>
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  if (error) {
    return (
      <AuthWrapper>
        <div className="h-100 d-flex align-items-center justify-content-center">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Ошибка!</h4>
            <p>{error}</p>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="h-100" style={{ background: '#f8f9fa' }}>
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="row mb-4">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1">
                    <i className="fas fa-users text-success me-3"></i>
                    Пользователи системы
                  </h2>
                  <p className="text-muted mb-0">
                    Управление пользователями и их правами доступа
                  </p>
                </div>
                <div>
                  <span className="badge bg-secondary fs-6">
                    {users.length} пользователей
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="row">
            {users.length === 0 ? (
              <div className="col-12">
                <div className="text-center py-5">
                  <i className="fas fa-users fa-5x text-muted mb-3"></i>
                  <h4 className="text-muted">Пользователи не найдены</h4>
                  <p className="text-muted">В системе пока нет зарегистрированных пользователей</p>
                </div>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                  <div className="card h-100 shadow-sm border-0 animate__animated animate__fadeIn" style={{ borderRadius: '12px' }}>
                    <div className="card-body p-4">
                      {/* User Header */}
                      <div className="d-flex align-items-center mb-3">
                        <div className="avatar-circle me-3">
                          <i className="fas fa-user fa-2x text-white"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1 fw-bold">{user.name}</h5>
                          <p className="card-text text-muted small mb-0">ID: #{user.id}</p>
                        </div>
                        {getRoleBadge(user.role)}
                      </div>

                      {/* User Details */}
                      <div className="user-details">
                        <div className="detail-row mb-2">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-envelope text-muted me-2"></i>
                            <small className="text-muted">Email:</small>
                          </div>
                          <div className="fw-medium">{user.email}</div>
                        </div>

                        <div className="detail-row mb-2">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-calendar-plus text-muted me-2"></i>
                            <small className="text-muted">Регистрация:</small>
                          </div>
                          <div className="fw-medium">{formatDate(user.created_at).short}</div>
                        </div>

                        <div className="detail-row">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-clock text-muted me-2"></i>
                            <small className="text-muted">Последний вход:</small>
                          </div>
                          <div className="fw-medium">{formatDate(user.updated_at).short}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-top">
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary btn-sm flex-fill">
                            <i className="fas fa-edit me-1"></i>
                            Редактировать
                          </button>
                          <button className="btn btn-outline-danger btn-sm">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .avatar-circle {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0.5rem 0;
        }
        
        .detail-row:not(:last-child) {
          border-bottom: 1px solid #f1f3f4;
        }
        
        .card:hover {
          transform: translateY(-3px);
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        
        .badge {
          font-size: 0.75rem;
        }
      `}</style>
    </AuthWrapper>
  );
}
'use client';
import React, { useMemo }from 'react';
import { useTranslation } from 'react-i18next';
import { User, getRoleLabel, getRoleColor } from '@/types/users';
import { formatDate } from '@/utils/dateUtils';

// Компонент строки пользователя
const UserTableRow: React.FC<{
  user: User,
  onEdit: (userId: number) => void,
  onSettings: (userId: number) => void,
  onDelete: (userId: number) => void
}> = React.memo(({ user, onEdit, onSettings, onDelete }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const createdDate = useMemo(() => formatDate(user.created_at, currentLang), [user.created_at, currentLang]);
  const updatedDate = useMemo(() => formatDate(user.updated_at, currentLang), [user.updated_at, currentLang]);

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

export default UserTableRow;
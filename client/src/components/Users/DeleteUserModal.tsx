// client/src/components/Users/DeleteUserModal.tsx
import React from 'react';
import { User } from '@/types/users';
import styles from '../Products/Products.module.css';
import Portal from '@/components/UI/Portal';
import { useTranslation } from 'react-i18next';
import { getRoleLabel, getRoleColor } from '@/types/users';

interface DeleteUserModalProps {
  show: boolean;
  user: User;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ 
  show, 
  user, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}) => {
  const { t } = useTranslation(['common', 'users']);

  if (!show) return null;

  return (
    <Portal>
      <div className="modal fade show" style={{ display: 'block', zIndex: 10001 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
          <div className="modal-content animate__animated animate__zoomIn" style={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <button
              type="button"
              className={`${styles.orderDetails__closeButton}`}
              onClick={onClose}
              disabled={isDeleting}
              aria-label="Закрыть"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
              </svg>
            </button>
            
            <div className="modal-body px-0 py-0 mt-2">
              <h5 className="p-4 fw-bold">
                <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                {t('users:confirmDelete', { name: user.name })}
              </h5>
              
              {/* Информация о пользователе */}
              <div className='d-flex border border-1 justify-content-between align-items-center px-4 py-3 mx-4 rounded-2 bg-light'>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#f8f9fa',
                      border: '2px solid #e9ecef'
                    }}
                  >
                    <i className="fas fa-user text-muted fs-5"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{user.name}</div>
                    <div className="text-muted small mb-1">{user.email}</div>
                    <span className={`badge ${getRoleColor(user.role)} small`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Предупреждение */}
              <div className="px-4 pb-3 pt-3">
                <div className="alert alert-warning d-flex align-items-start mb-0">
                  <i className="fas fa-exclamation-triangle me-2 mt-1"></i>
                  <div>
                    <small>
                      <strong>{t('common:warning')}:</strong> {t('users:deleteWarning')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer justify-content-end border-0 pb-4" style={{backgroundColor:"#69b838ff"}}>
              <button
                type="button"
                className="btn"
                onClick={onClose}
                disabled={isDeleting}
                style={{ fontWeight: '500', color: 'white' }}
              >
                {t('common:cancel')}
              </button>
              <button
                type="button"
                className="btn btn-light px-4 py-2 me-3"
                onClick={onConfirm}
                disabled={isDeleting}
                style={{ borderRadius: '25px', fontWeight: '500', color: '#dc3545', border: 'none' }}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                   {t('common:deleting')}...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash me-1"></i>
                    {t('common:delete')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000 }}></div>
    </Portal>
  );
};

export default DeleteUserModal;
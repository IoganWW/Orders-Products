// client/src/components/Users/DeleteUserModal.tsx
import React from 'react';
import { User } from '@/types/users';
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
      <div className="modal fade show d-block" style={{ zIndex: 10001 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
          <div className="modal-content animate__animated animate__zoomIn border-0 rounded-3 shadow-lg position-relative">
            <button
              type="button"
              className="btn-close position-absolute bg-white rounded-circle border shadow-sm"
              style={{ 
                top: '0', 
                right: '0',
                transform: 'translate(50%, -50%)',
                width: '35px', 
                height: '35px',
                zIndex: 50 
              }}
              onClick={onClose}
              disabled={isDeleting}
              aria-label="Закрыть"
            />
            
            <div className="modal-body px-0 py-0 mt-2">
              <h5 className="p-4 fw-bold mb-0">
                <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                {t('users:confirmDelete', { name: user.name })}
              </h5>
              
              {/* Информация о пользователе */}
              <div className='d-flex border justify-content-between align-items-center px-4 py-3 mx-4 rounded-2 bg-light'>
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
            
            <div className="modal-footer justify-content-end border-0 pb-4 rounded-bottom-3" style={{backgroundColor:"#69b838ff"}}>
              <button
                type="button"
                className="btn text-white fw-medium"
                onClick={onClose}
                disabled={isDeleting}
              >
                {t('common:cancel')}
              </button>
              <button
                type="button"
                className="btn btn-light px-4 py-2 me-3 border-0 fw-medium text-danger rounded-pill"
                onClick={onConfirm}
                disabled={isDeleting}
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
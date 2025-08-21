// client/src/components/Auth/AuthModal.tsx
'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import styles from './Auth.module.css';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  if (!show) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: 'block', zIndex: 1055 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
            <div className="modal-header border-0" style={{ borderRadius: '12px 12px 0 0', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: 'white' }}>
              <h5 className="modal-title">
                {activeTab === 'login' ? 'Вход в систему' : 'Регистрация'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body p-0">
              {/* Вкладки */}
              <div className={`${styles.authTabs}`}>
                <button
                  className={`${styles.authTab} ${activeTab === 'login' ? styles.active : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Авторизация
                </button>
                <button
                  className={`${styles.authTab} ${activeTab === 'register' ? styles.active : ''}`}
                  onClick={() => setActiveTab('register')}
                >
                  Регистрация
                </button>
              </div>

              {/* Контент вкладок */}
              <div className={`${styles.authContent}`}>
                {activeTab === 'login' ? (
                  <LoginForm onSuccess={onClose} />
                ) : (
                  <RegisterForm onSuccess={() => setActiveTab('login')} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default AuthModal;
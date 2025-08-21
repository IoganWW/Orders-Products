// client/src/components/Auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store';
import { loginUser } from '@/store/slices/authSlice';
import FormField from '@/components/UI/FormField';
import { useFormValidation, FieldConfig } from '@/hooks/useFormValidation';
import styles from './Auth.module.css';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    email: '',
    password: '',
  };

  const validationConfig: FieldConfig = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Введите корректный email адрес';
        }
        return null;
      }
    },
    password: {
      required: true,
      minLength: 6,
      custom: (value) => {
        if (value && value.length < 6) {
          return 'Пароль должен содержать минимум 6 символов';
        }
        return null;
      }
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldError
  } = useFormValidation(initialValues, validationConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(loginUser(values)).unwrap();
      
      const successEvent = new CustomEvent('showNotification', {
        detail: { type: 'success', message: 'Добро пожаловать в систему!' }
      });
      window.dispatchEvent(successEvent);
      
      resetForm();
      onSuccess();
      
      // Редирект на страницу Orders после успешного входа
      router.push('/');
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Устанавливаем ошибку для конкретного поля или общую ошибку
      if (error.includes('email')) {
        setFieldError('email', 'Пользователь с таким email не найден');
      } else if (error.includes('password')) {
        setFieldError('password', 'Неверный пароль');
      } else {
        const errorEvent = new CustomEvent('showNotification', {
          detail: { type: 'error', message: error || 'Ошибка при входе в систему' }
        });
        window.dispatchEvent(errorEvent);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.authForm}`}>
      <div className="text-center mb-4">
        <h6 className="text-muted">Войдите в свой аккаунт</h6>
      </div>

      <form onSubmit={handleSubmit}>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          error={errors.email}
          touched={touched.email}
          placeholder="example@company.com"
          required
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <FormField
          label="Пароль"
          name="password"
          type="password"
          value={values.password}
          error={errors.password}
          touched={touched.password}
          placeholder="Введите пароль"
          required
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 mt-3"
          disabled={isSubmitting}
          style={{ borderRadius: '8px', fontWeight: '500' }}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Вход...
            </>
          ) : (
            <>
              Войти
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
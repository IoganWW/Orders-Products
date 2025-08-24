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

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: LoginFormData = {
    email: '',
    password: '',
  };

  const validationConfig: FieldConfig = {
    email: {
      required: true,
      email: true,
      custom: (value: string) => {
        if (!value?.trim()) {
          return 'Email обязателен для заполнения';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Введите корректный email адрес';
        }
        return null;
      }
    },
    password: {
      required: true,
      minLength: 1,
      custom: (value: string) => {
        if (!value) {
          return 'Пароль обязателен для заполнения';
        }
        return null;
      }
    }
  };

  // ✅ ТОЛЬКО НУЖНЫЕ ФУНКЦИИ
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldValue // Для очистки пароля после ошибки
  } = useFormValidation<LoginFormData>(initialValues, validationConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormValid = await validateForm();
    if (!isFormValid) {
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
      router.push('/');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // 🔒 БЕЗОПАСНОЕ СООБЩЕНИЕ
      const errorEvent = new CustomEvent('showNotification', {
        detail: { 
          type: 'error', 
          message: 'Неверный email или пароль. Попробуйте еще раз.' 
        }
      });
      window.dispatchEvent(errorEvent);
      
      // Очищаем пароль для безопасности
      setFieldValue('password', '');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.authForm}`}>
      <div className="text-center mb-4">
        <h6 className="text-muted">Войдите в свой аккаунт</h6>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          error={errors.email}
          touched={touched.email}
          placeholder="example@company.com"
          required
          autoComplete="email"
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
          autoComplete="current-password"
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 mt-3"
          disabled={isSubmitting} // ← Можно добавить || !isValid если нужно
          style={{ borderRadius: '8px', fontWeight: '500' }}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Вход...
            </>
          ) : (
            'Войти'
          )}
        </button>

        <div className="text-center mt-3">
          <small className="text-muted">
            Используйте ваш email и пароль для входа
          </small>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
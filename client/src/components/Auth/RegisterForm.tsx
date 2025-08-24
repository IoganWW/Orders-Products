// client/src/components/Auth/RegisterForm.tsx
'use client';

import React, { useState } from 'react';
import FormField from '@/components/UI/FormField';
import { useFormValidation, FieldConfig } from '@/hooks/useFormValidation';
import styles from './Auth.module.css';

interface RegisterFormProps {
  onSuccess: () => void;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: RegisterFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const validationConfig: FieldConfig = {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100,
      custom: (value: string) => {
        if (!value?.trim()) {
          return 'Имя обязательно для заполнения';
        }
        if (value.trim().split(' ').length < 2) {
          return 'Введите имя и фамилию';
        }
        if (!/^[a-zA-Zа-яА-Я\s]+$/.test(value)) {
          return 'Имя должно содержать только буквы';
        }
        return null;
      }
    },
    email: {
      required: true,
      email: true,
      maxLength: 100,
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
      minLength: 6,
      maxLength: 128,
      custom: (value: string) => {
        if (!value) {
          return 'Пароль обязателен для заполнения';
        }
        if (value.length < 6) {
          return 'Пароль должен содержать минимум 6 символов';
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          return 'Пароль должен содержать буквы и цифры';
        }
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value: string, allValues?: any) => {
        if (!value) {
          return 'Подтверждение пароля обязательно';
        }
        if (allValues && value !== allValues.password) {
          return 'Пароли не совпадают';
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
    isValid
  } = useFormValidation<RegisterFormData>(initialValues, validationConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isFormValid = await validateForm();
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password
        }),
      });

      if (response.ok) {
        const successEvent = new CustomEvent('showNotification', {
          detail: { type: 'success', message: 'Регистрация успешна! Теперь войдите в систему.' }
        });
        window.dispatchEvent(successEvent);
        
        resetForm();
        onSuccess();
      } else {
        const errorData = await response.json();
        
        // Обработка специфических ошибок от сервера
        if (errorData.error?.includes('email')) {
          const errorEvent = new CustomEvent('showNotification', {
            detail: { type: 'error', message: 'Пользователь с таким email уже существует' }
          });
          window.dispatchEvent(errorEvent);
        } else {
          throw new Error(errorData.error || 'Ошибка регистрации');
        }
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorEvent = new CustomEvent('showNotification', {
        detail: { type: 'error', message: error.message || 'Ошибка при регистрации' }
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.authForm}`}>
      <div className="text-center mb-4">
        <h6 className="text-muted">Создайте новый аккаунт</h6>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Имя и Фамилия"
          name="name"
          value={values.name}
          error={errors.name}
          touched={touched.name}
          placeholder="Иван Иванов"
          required
          onChange={handleChange}
          onBlur={handleBlur}
        />

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

        <div className="row">
          <div className="col-md-6">
            <FormField
              label="Пароль"
              name="password"
              type="password"
              value={values.password}
              error={errors.password}
              touched={touched.password}
              placeholder="Минимум 6 символов"
              required
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
          
          <div className="col-md-6">
            <FormField
              label="Подтвердите пароль"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              placeholder="Повторите пароль"
              required
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-success w-100 py-2 mt-3"
          disabled={isSubmitting || !isValid}
          style={{ borderRadius: '8px', fontWeight: '500' }}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Регистрация...
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </button>

        <div className="alert alert-info mt-3">
          <i className="fas fa-info-circle me-2"></i>
          <small>
            • Пароль должен содержать буквы и цифры<br/>
            • Имя и фамилия обязательны<br/>
            • Email должен быть корректным
          </small>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
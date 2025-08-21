// client/src/components/Auth/RegisterForm.tsx
'use client';

import React, { useState } from 'react';
import FormField from '@/components/UI/FormField';
import { useFormValidation, FieldConfig } from '@/hooks/useFormValidation';
import styles from './Auth.module.css';

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
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
      custom: (value) => {
        if (value && value.trim().split(' ').length < 2) {
          return 'Введите имя и фамилию';
        }
        return null;
      }
    },
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
        if (value && !/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          return 'Пароль должен содержать буквы и цифры';
        }
        return null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value) => {
        if (value && value !== values.password) {
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
    resetForm
  } = useFormValidation(initialValues, validationConfig);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
        throw new Error(errorData.error || 'Ошибка регистрации');
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

      <form onSubmit={handleSubmit}>
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
          disabled={isSubmitting}
          style={{ borderRadius: '8px', fontWeight: '500' }}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Регистрация...
            </>
          ) : (
            <>
              Зарегистрироваться
            </>
          )}
        </button>

        <div className="alert alert-info mt-3">
          <i className="fas fa-info-circle me-2"></i>
          <small>Пароль должен содержать буквы и цифры</small>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
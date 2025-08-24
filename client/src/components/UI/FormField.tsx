// client/src/components/UI/FormField.tsx
import React from 'react';
import styles from './Forms.module.css';

// 🎯 Строгая типизация пропсов
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'date' | 'datetime-local';

export interface FormFieldProps<T = any> {
  label: string;
  name: string;
  type?: InputType;
  value: T;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoComplete?: string;
  onChange: (name: string, value: T) => void;
  onBlur: (name: string) => void;
  children?: React.ReactNode;
  // Дополнительные пропсы для textarea
  rows?: number;
  // Дополнительные пропсы для input
  min?: number;
  max?: number;
  step?: number | string;
  // CSS classes
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  // Дополнительные атрибуты
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// 🎯 Типизированный компонент с дженериками
const FormField = <T extends string>({
  label,
  name,
  type = 'text',
  value,
  error,
  touched = false,
  placeholder,
  required = false,
  disabled = false,
  readonly = false,
  autoComplete,
  onChange,
  onBlur,
  children,
  rows = 4,
  min,
  max,
  step,
  maxLength,
  minLength,
  pattern,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}: FormFieldProps<T>): React.ReactElement => {
  
  // 🎯 Типизированные обработчики событий
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    let newValue: T;
    
    if (type === 'number') {
      newValue = (e.target.value === '' ? '' : Number(e.target.value)) as T;
    } else {
      newValue = e.target.value as T;
    }
    
    onChange(name, newValue);
  };

  const handleInputBlur = (): void => {
    onBlur(name);
  };

  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;
  const hasError = touched && !!error;

  // 🎯 Типизированные общие пропсы для input элементов
  const commonInputProps = {
    id: inputId,
    name,
    value: value || '',
    placeholder,
    disabled,
    readOnly: readonly,
    autoComplete,
    maxLength,
    minLength,
    pattern,
    onChange: handleInputChange,
    onBlur: handleInputBlur,
    'aria-invalid': hasError,
    'aria-describedby': [
      hasError ? errorId : undefined,
      ariaDescribedBy,
    ].filter(Boolean).join(' ') || undefined,
    'aria-label': ariaLabel,
    'aria-required': required,
  } as const;

  const getInputClassName = () => `form-control ${hasError ? 'is-invalid' : ''} ${inputClassName}`.trim();

  const renderInput = () => {
    if (children) {
      // Custom input (select, etc.)
      return (
        <div className={`${styles.formControl} ${hasError ? styles.error : ''}`}>
          {React.cloneElement(children as React.ReactElement<any>, {
            ...commonInputProps,
            className: getInputClassName()
          })}
        </div>
      );
    }
    
    if (type === 'textarea') {
      // Textarea
      return (
        <textarea
          {...commonInputProps}
          className={getInputClassName()}
          rows={rows}
        />
      );
    }
    
    // Regular input
    return (
      <input
        {...commonInputProps}
        className={getInputClassName()}
        type={type}
        min={type === 'number' || type === 'date' || type === 'datetime-local' ? min : undefined}
        max={type === 'number' || type === 'date' || type === 'datetime-local' ? max : undefined}
        step={type === 'number' ? step : undefined}
      />
    );
  };

  return (
    <div className={`${styles.formField} form-field mb-3 ${className}`.trim()}>
      <label 
        htmlFor={inputId} 
        className={`${styles.formLabel} form-label ${labelClassName}`.trim()}
      >
        {label}
        {required && (
          <span 
            className="text-danger ms-1" 
            aria-label="обязательное поле"
            title="Обязательное поле"
          >
            *
          </span>
        )}
      </label>
      
      {renderInput()}

      {hasError && (
        <div 
          id={errorId}
          className={`${styles.formError} invalid-feedback d-block ${errorClassName}`.trim()}
          role="alert"
          aria-live="polite"
        >
          <i className="fas fa-exclamation-circle me-1" aria-hidden="true"></i>
          {error}
        </div>
      )}
      
      {/* Опциональная подсказка для поля */}
      {!hasError && (type === 'password' || type === 'email') && (
        <div 
          id={helpId}
          className={`${styles.formHelp} form-text text-muted`}
          aria-live="polite"
        >
          {type === 'password' && 'Минимум 6 символов, включая буквы и цифры'}
          {type === 'email' && 'Введите корректный email адрес'}
        </div>
      )}
    </div>
  );
};

export default FormField;
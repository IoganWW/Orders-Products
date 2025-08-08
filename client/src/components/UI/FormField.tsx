import React from 'react';
import styles from './Forms.module.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (name: string, value: any) => void;
  onBlur: (name: string) => void;
  children?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  onChange,
  onBlur,
  children
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(name, newValue);
  };

  const handleInputBlur = () => {
    onBlur(name);
  };

  const inputId = `field-${name}`;
  const hasError = touched && error;

  return (
    <div className={`${styles.formField} form-field mb-3`}>
      <label htmlFor={inputId} className={`${styles.formLabel} form-label`}>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      
      {children ? (
        // Custom input (select, etc.)
        <div className={`${styles.formControl} ${hasError ? styles.error : ''}`}>
          {children}
        </div>
      ) : type === 'textarea' ? (
        // Textarea
        <textarea
          id={inputId}
          name={name}
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-control ${hasError ? 'is-invalid' : ''}`}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          rows={4}
        />
      ) : (
        // Regular input
        <input
          id={inputId}
          name={name}
          type={type}
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-control ${hasError ? 'is-invalid' : ''}`}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
      )}

      {hasError && (
        <div className={`${styles.formError} invalid-feedback d-block`}>
          <i className="fas fa-exclamation-circle me-1"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
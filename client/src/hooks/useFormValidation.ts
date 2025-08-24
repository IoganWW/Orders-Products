import { useState, useCallback, useMemo } from 'react';

// 🎯 Строгая типизация для правил валидации
export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: T, allValues?: FormValues) => string | null;
  customAsync?: (value: T, allValues?: FormValues) => Promise<string | null>;
}

export interface FieldConfig {
  [fieldName: string]: ValidationRule;
}

export interface FormErrors {
  [fieldName: string]: string;
}

export interface FormTouched {
  [fieldName: string]: boolean;
}

export interface FormValues {
  [fieldName: string]: any;
}

// 🎯 Интерфейс для возвращаемых значений хука
export interface UseFormValidationReturn<T extends FormValues> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  handleChange: (fieldName: string, value: any) => void;
  handleBlur: (fieldName: string) => void;
  validateForm: () => Promise<boolean>;
  validateField: (fieldName: keyof T, value?: any) => Promise<string>;
  resetForm: () => void;
  setFieldValue: (fieldName: string, value: any) => void;
  setFieldError: (fieldName: string, error: string) => void;
  setFieldTouched: (fieldName: string, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<FormErrors>) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  submitForm: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>;
}

// 🎯 Типизированный хук валидации
export const useFormValidation = <T extends FormValues>(
  initialValues: T,
  validationConfig: FieldConfig
): UseFormValidationReturn<T> => {
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 🎯 Мемоизированные вычисления
  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // 🎯 Улучшенная функция валидации поля
  const validateField = useCallback(async (
    fieldName: keyof T, 
    value?: any,
    currentValues?: T // Добавлен параметр для актуальных значений
  ): Promise<string> => {
    const fieldValue = value !== undefined ? value : values[fieldName];
    const allValues = currentValues || values; // Используем переданные значения или текущие
    const rules = validationConfig[fieldName as string];
    
    if (!rules) return '';

    // Required validation
    if (rules.required) {
      if (fieldValue === null || fieldValue === undefined || 
          (typeof fieldValue === 'string' && fieldValue.trim() === '') ||
          (Array.isArray(fieldValue) && fieldValue.length === 0)) {
        return `${String(fieldName)} обязательно для заполнения`;
      }
    }

    // Skip other validations if field is empty and not required
    if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      return '';
    }

    const stringValue = String(fieldValue);

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        return `${String(fieldName)} должно быть корректным email адресом`;
      }
    }

    // Min length validation
    if (rules.minLength && stringValue.length < rules.minLength) {
      return `${String(fieldName)} должно содержать минимум ${rules.minLength} символов`;
    }

    // Max length validation
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return `${String(fieldName)} должно содержать максимум ${rules.maxLength} символов`;
    }

    // Min value validation
    if (rules.min !== undefined && Number(fieldValue) < rules.min) {
      return `${String(fieldName)} должно быть не менее ${rules.min}`;
    }

    // Max value validation
    if (rules.max !== undefined && Number(fieldValue) > rules.max) {
      return `${String(fieldName)} должно быть не более ${rules.max}`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return `${String(fieldName)} имеет неправильный формат`;
    }

    // Custom validation - передаем актуальные значения
    if (rules.custom) {
      const customError = rules.custom(fieldValue, allValues);
      if (customError) return customError;
    }

    // Custom async validation
    if (rules.customAsync) {
      try {
        const customError = await rules.customAsync(fieldValue, allValues);
        if (customError) return customError;
      } catch (error) {
        return `Ошибка при валидации ${String(fieldName)}`;
      }
    }

    return '';
  }, [values, validationConfig]);

  // 🎯 Валидация всей формы
  const validateForm = useCallback(async (): Promise<boolean> => {
    const newErrors: FormErrors = {};
    const fieldNames = Object.keys(validationConfig) as (keyof T)[];

    // Валидируем все поля параллельно с актуальными значениями
    const validationPromises = fieldNames.map(async (fieldName) => {
      const error = await validateField(fieldName, values[fieldName], values);
      return { fieldName, error };
    });

    const validationResults = await Promise.all(validationPromises);
    
    let isFormValid = true;
    validationResults.forEach(({ fieldName, error }) => {
      if (error) {
        newErrors[fieldName as string] = error;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [validateField, validationConfig, values]);

  // 🎯 Обработчики событий
  const handleChange = useCallback((fieldName: string, value: any) => {
    const newValues = {
      ...values,
      [fieldName]: value
    };
    
    setValues(newValues);

    // Валидируем поле при изменении с новыми значениями, если оно уже было затронуто
    if (touched[fieldName as string]) {
      validateField(fieldName as keyof T, value, newValues).then(error => {
        setErrors(prev => ({
          ...prev,
          [fieldName as string]: error
        }));
      });
    }
  }, [touched, validateField, values]);

  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName as string]: true
    }));

    validateField(fieldName as keyof T, values[fieldName as keyof T], values).then(error => {
      setErrors(prev => ({
        ...prev,
        [fieldName as string]: error
      }));
    });
  }, [validateField, values]);

  // 🎯 Утилитарные функции
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((fieldName: string, value: any) => {
    handleChange(fieldName, value);
  }, [handleChange]);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName as string]: error
    }));
  }, []);

  const setFieldTouched = useCallback((fieldName: string, touchedValue: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [fieldName as string]: touchedValue
    }));
  }, []);

  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const setFormErrors = useCallback((newErrors: Partial<FormErrors>) => {
    setErrors(prev => {
      const updated = { ...prev };
      Object.entries(newErrors).forEach(([key, value]) => {
        if (value !== undefined) {
          updated[key] = value;
        }
      });
      return updated;
    });
  }, []);

  // 🎯 Функция отправки формы
  const submitForm = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      // Отмечаем все поля как затронутые
      const allFieldsTouched = Object.keys(validationConfig).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as FormTouched);
      setTouched(allFieldsTouched);

      // Валидируем форму
      const isFormValid = await validateForm();
      
      if (!isFormValid) {
        return;
      }

      // Выполняем отправку
      await onSubmit(values);
      
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validationConfig, validateForm]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    validateForm,
    validateField,
    resetForm,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues: setFormValues,
    setErrors: setFormErrors,
    setSubmitting: setIsSubmitting,
    submitForm
  };
};
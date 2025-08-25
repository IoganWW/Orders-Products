// client/src/utils/validation.ts - ПОЛНАЯ ВЕРСИЯ С УКРАИНСКОЙ ПОДДЕРЖКОЙ
import { ValidationRule } from '@/hooks/useFormValidation';
import { LoginFormData, RegisterFormData, LoginFormErrors, RegisterFormErrors } from '@/types/auth';

// 🎯 Типизированные регулярные выражения
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  // ✅ ОБНОВЛЕНО: поддержка украинского языка
  LETTERS_ONLY: /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s]+$/,
  NAME: /^[a-zA-Zа-yaА-ЯіІїЇєЄґҐ\s]+$/,
  NUMBERS_ONLY: /^\d+$/,
  SERIAL_NUMBER: /^[A-Za-z0-9\-]+$/
} as const;

// 🇺🇦 Расширенный regex для всех кириллических языков
export const EXTENDED_CYRILLIC = /^[a-zA-ZаАбБвВгГґҐдДеЕєЄёЁжЖзЗиИіІїЇйЙкКлЛмМнНоОпПрРсСтТуУфФхХцЦчЧшШщЩъЪыЫьЬэЭюЮяЯ\s]+$/;

// 🎯 Константы для валидации
export const VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  DESCRIPTION_MAX_LENGTH: 1000,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  SERIAL_NUMBER_MIN_LENGTH: 4,
  SERIAL_NUMBER_MAX_LENGTH: 50,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 255
} as const;

// 🎯 Типизированные сообщения об ошибках (русский)
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} обязательно для заполнения`,
  EMAIL_INVALID: 'Введите корректный email адрес',
  EMAIL_EXISTS: 'Пользователь с таким email уже существует',
  PASSWORD_WEAK: 'Пароль должен содержать минимум 6 символов, включая буквы и цифры',
  PASSWORD_STRONG: 'Пароль должен содержать строчные и заглавные буквы, цифры и специальные символы',
  PASSWORDS_NOT_MATCH: 'Пароли не совпадают',
  NAME_INVALID: 'Имя должно содержать только буквы и пробелы',
  NAME_FULL_REQUIRED: 'Введите имя и фамилию',
  MIN_LENGTH: (field: string, length: number) => `${field} должно содержать минимум ${length} символов`,
  MAX_LENGTH: (field: string, length: number) => `${field} должно содержать максимум ${length} символов`,
  PATTERN_MISMATCH: (field: string) => `${field} имеет неправильный формат`,
  MIN_VALUE: (field: string, min: number) => `${field} должно быть не менее ${min}`,
  MAX_VALUE: (field: string, max: number) => `${field} должно быть не более ${max}`,
  PHONE_INVALID: 'Введите корректный номер телефона',
  URL_INVALID: 'Введите корректный URL адрес',
  SERIAL_NUMBER_INVALID: 'Серийный номер может содержать только буквы, цифры и дефис',
  PRICE_INVALID: 'Цена должна быть положительным числом',
  DATE_INVALID: 'Введите корректную дату',
  DATE_FUTURE: 'Дата не может быть в будущем',
  DATE_PAST: 'Дата не может быть в прошлом'
} as const;

// 🇺🇦 Украинские сообщения валидации
export const UKRAINIAN_VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} обов'язково для заповнення`,
  EMAIL_INVALID: 'Введіть коректний email адрес',
  EMAIL_EXISTS: 'Користувач з таким email вже існує',
  PASSWORD_WEAK: 'Пароль повинен містити мінімум 6 символів, включаючи літери та цифри',
  PASSWORD_STRONG: 'Пароль повинен містити малі та великі літери, цифри та спеціальні символи',
  PASSWORDS_NOT_MATCH: 'Паролі не співпадають',
  NAME_INVALID: 'Ім\'я повинно містити тільки літери та пробіли',
  NAME_FULL_REQUIRED: 'Введіть ім\'я та прізвище',
  MIN_LENGTH: (field: string, length: number) => `${field} повинно містити мінімум ${length} символів`,
  MAX_LENGTH: (field: string, length: number) => `${field} повинно містити максимум ${length} символів`,
  PATTERN_MISMATCH: (field: string) => `${field} має неправильний формат`,
  MIN_VALUE: (field: string, min: number) => `${field} повинно бути не менше ${min}`,
  MAX_VALUE: (field: string, max: number) => `${field} повинно бути не більше ${max}`,
  PHONE_INVALID: 'Введіть коректний номер телефону',
  URL_INVALID: 'Введіть коректний URL адрес',
  SERIAL_NUMBER_INVALID: 'Серійний номер може містити тільки літери, цифри та дефіс',
  PRICE_INVALID: 'Ціна повинна бути позитивним числом',
  DATE_INVALID: 'Введіть коректну дату',
  DATE_FUTURE: 'Дата не може бути в майбутньому',
  DATE_PAST: 'Дата не може бути в минулому'
} as const;

// 🎯 Базовые функции валидации с типизацией
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_PATTERNS.EMAIL.test(email.trim());
};

export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return !isNaN(value);
  return true;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return typeof value === 'string' && value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return typeof value === 'string' && value.length <= maxLength;
};

export const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  return VALIDATION_PATTERNS.PASSWORD.test(password);
};

export const validateStrongPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  return VALIDATION_PATTERNS.PASSWORD_STRONG.test(password);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION_PATTERNS.PHONE.test(phone.replace(/\s/g, ''));
};

export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return VALIDATION_PATTERNS.URL.test(url);
};

export const validateName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  // ✅ Использует обновленный EXTENDED_CYRILLIC
  return EXTENDED_CYRILLIC.test(name.trim());
};

export const validateFullName = (name: string): boolean => {
  if (!validateName(name)) return false;
  const parts = name.trim().split(' ').filter(part => part.length > 0);
  return parts.length >= 2;
};

export const validateSerialNumber = (serialNumber: string): boolean => {
  if (!serialNumber || typeof serialNumber !== 'string') return false;
  return VALIDATION_PATTERNS.SERIAL_NUMBER.test(serialNumber);
};

export const validatePrice = (price: string | number): boolean => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num > 0;
};

export const validateDate = (date: string): boolean => {
  if (!date || typeof date !== 'string') return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const validateFutureDate = (date: string): boolean => {
  if (!validateDate(date)) return false;
  const parsedDate = new Date(date);
  const now = new Date();
  return parsedDate > now;
};

export const validatePastDate = (date: string): boolean => {
  if (!validateDate(date)) return false;
  const parsedDate = new Date(date);
  const now = new Date();
  return parsedDate <= now;
};

// 🎯 Готовые конфигурации валидации для аутентификации
export const LOGIN_VALIDATION_CONFIG: Record<keyof LoginFormData, ValidationRule> = {
  email: {
    required: true,
    email: true,
    maxLength: VALIDATION_LIMITS.EMAIL_MAX_LENGTH,
    custom: (value: string) => {
      if (!value?.trim()) {
        return VALIDATION_MESSAGES.REQUIRED('Email');
      }
      if (!validateEmail(value)) {
        return VALIDATION_MESSAGES.EMAIL_INVALID;
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: 1, // Для логина минимум 1 символ
    custom: (value: string) => {
      if (!value) {
        return VALIDATION_MESSAGES.REQUIRED('Пароль');
      }
      return null;
    }
  }
};

export const REGISTER_VALIDATION_CONFIG: Record<keyof RegisterFormData, ValidationRule> = {
  name: {
    required: true,
    minLength: VALIDATION_LIMITS.NAME_MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.NAME_MAX_LENGTH,
    pattern: VALIDATION_PATTERNS.NAME,
    custom: (value: string) => {
      if (!value?.trim()) {
        return VALIDATION_MESSAGES.REQUIRED('Имя');
      }
      if (!validateName(value)) {
        return VALIDATION_MESSAGES.NAME_INVALID;
      }
      if (!validateFullName(value)) {
        return VALIDATION_MESSAGES.NAME_FULL_REQUIRED;
      }
      return null;
    }
  },
  email: {
    required: true,
    email: true,
    maxLength: VALIDATION_LIMITS.EMAIL_MAX_LENGTH,
    custom: (value: string) => {
      if (!value?.trim()) {
        return VALIDATION_MESSAGES.REQUIRED('Email');
      }
      if (!validateEmail(value)) {
        return VALIDATION_MESSAGES.EMAIL_INVALID;
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: VALIDATION_LIMITS.PASSWORD_MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.PASSWORD_MAX_LENGTH,
    custom: (value: string) => {
      if (!value) {
        return VALIDATION_MESSAGES.REQUIRED('Пароль');
      }
      if (!validatePassword(value)) {
        return VALIDATION_MESSAGES.PASSWORD_WEAK;
      }
      return null;
    }
  },
  confirmPassword: {
    required: true,
    custom: (value: string, allValues?: any) => {
      if (!value) {
        return VALIDATION_MESSAGES.REQUIRED('Подтверждение пароля');
      }
      if (allValues && value !== allValues.password) {
        return VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH;
      }
      return null;
    }
  }
};

// 🎯 Функции валидации форм
export const validateLoginForm = (formData: LoginFormData): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  // Валидация email
  if (!formData.email?.trim()) {
    errors.email = VALIDATION_MESSAGES.REQUIRED('Email');
  } else if (!validateEmail(formData.email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  // Валидация пароля
  if (!formData.password) {
    errors.password = VALIDATION_MESSAGES.REQUIRED('Пароль');
  }

  return errors;
};

export const validateRegisterForm = (formData: RegisterFormData): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  // Валидация имени
  if (!formData.name?.trim()) {
    errors.name = VALIDATION_MESSAGES.REQUIRED('Имя');
  } else if (!validateName(formData.name)) {
    errors.name = VALIDATION_MESSAGES.NAME_INVALID;
  } else if (!validateFullName(formData.name)) {
    errors.name = VALIDATION_MESSAGES.NAME_FULL_REQUIRED;
  } else if (formData.name.length < VALIDATION_LIMITS.NAME_MIN_LENGTH) {
    errors.name = VALIDATION_MESSAGES.MIN_LENGTH('Имя', VALIDATION_LIMITS.NAME_MIN_LENGTH);
  } else if (formData.name.length > VALIDATION_LIMITS.NAME_MAX_LENGTH) {
    errors.name = VALIDATION_MESSAGES.MAX_LENGTH('Имя', VALIDATION_LIMITS.NAME_MAX_LENGTH);
  }

  // Валидация email
  if (!formData.email?.trim()) {
    errors.email = VALIDATION_MESSAGES.REQUIRED('Email');
  } else if (!validateEmail(formData.email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  } else if (formData.email.length > VALIDATION_LIMITS.EMAIL_MAX_LENGTH) {
    errors.email = VALIDATION_MESSAGES.MAX_LENGTH('Email', VALIDATION_LIMITS.EMAIL_MAX_LENGTH);
  }

  // Валидация пароля
  if (!formData.password) {
    errors.password = VALIDATION_MESSAGES.REQUIRED('Пароль');
  } else if (!validatePassword(formData.password)) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_WEAK;
  } else if (formData.password.length > VALIDATION_LIMITS.PASSWORD_MAX_LENGTH) {
    errors.password = VALIDATION_MESSAGES.MAX_LENGTH('Пароль', VALIDATION_LIMITS.PASSWORD_MAX_LENGTH);
  }

  // Валидация подтверждения пароля
  if (!formData.confirmPassword) {
    errors.confirmPassword = VALIDATION_MESSAGES.REQUIRED('Подтверждение пароля');
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH;
  }

  return errors;
};

// 🎯 Дополнительные утилиты
export const sanitizeInput = (input: string): string => {
  return input?.trim().replace(/\s+/g, ' ') || '';
};

export const normalizeEmail = (email: string): string => {
  return email?.toLowerCase().trim() || '';
};

export const normalizePhone = (phone: string): string => {
  return phone?.replace(/\D/g, '') || '';
};

export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency
  }).format(price);
};

// 🎯 Проверка силы пароля
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
  isVeryStrong: boolean;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      feedback: ['Введите пароль'],
      isStrong: false,
      isVeryStrong: false
    };
  }

  // Длина
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Используйте минимум 8 символов');
  }

  // Строчные буквы
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте строчные буквы (a-z)');
  }

  // Заглавные буквы
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте заглавные буквы (A-Z)');
  }

  // Цифры
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте цифры (0-9)');
  }

  // Специальные символы
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте специальные символы (!@#$%^&*)');
  }

  const isStrong = score >= 3;
  const isVeryStrong = score >= 4;

  return {
    score: Math.min(score, 4),
    feedback: isStrong ? [] : feedback,
    isStrong,
    isVeryStrong
  };
};

// 🎯 Утилита для проверки уникальности email (для использования с API)
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizeEmail(email) }),
    });
    
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error('Email availability check failed:', error);
    return true; // В случае ошибки считаем email доступным
  }
};

// 🎯 Валидация файлов
export const validateFile = (
  file: File,
  options: {
    maxSize?: number; // в байтах
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): string | null => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;

  if (maxSize && file.size > maxSize) {
    return `Размер файла не должен превышать ${Math.round(maxSize / 1024 / 1024)}MB`;
  }

  if (allowedTypes.length && !allowedTypes.includes(file.type)) {
    return `Недопустимый тип файла. Разрешены: ${allowedTypes.join(', ')}`;
  }

  if (allowedExtensions.length) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return `Недопустимое расширение файла. Разрешены: ${allowedExtensions.join(', ')}`;
    }
  }

  return null;
};

// 🎯 Конфигурации валидации для продуктов и заказов
export const PRODUCT_VALIDATION_CONFIG = {
  title: {
    required: true,
    minLength: VALIDATION_LIMITS.TITLE_MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.TITLE_MAX_LENGTH,
    custom: (value: string) => {
      if (!value?.trim()) {
        return VALIDATION_MESSAGES.REQUIRED('Название продукта');
      }
      return null;
    }
  },
  specification: {
    required: true,
    minLength: 10,
    maxLength: VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH,
    custom: (value: string) => {
      if (!value?.trim()) {
        return VALIDATION_MESSAGES.REQUIRED('Спецификация');
      }
      return null;
    }
  },
  serialNumber: {
    required: true,
    minLength: VALIDATION_LIMITS.SERIAL_NUMBER_MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.SERIAL_NUMBER_MAX_LENGTH,
    pattern: VALIDATION_PATTERNS.SERIAL_NUMBER,
    custom: (value: string) => {
      if (!value?.trim()) {
        return VALIDATION_MESSAGES.REQUIRED('Серийный номер');
      }
      if (!validateSerialNumber(value)) {
        return VALIDATION_MESSAGES.SERIAL_NUMBER_INVALID;
      }
      return null;
    }
  },
  priceUSD: {
    required: true,
    custom: (value: string | number) => {
      if (!value && value !== 0) {
        return VALIDATION_MESSAGES.REQUIRED('Цена USD');
      }
      if (!validatePrice(value)) {
        return VALIDATION_MESSAGES.PRICE_INVALID;
      }
      return null;
    }
  },
  priceUAH: {
    required: true,
    custom: (value: string | number) => {
      if (!value && value !== 0) {
        return VALIDATION_MESSAGES.REQUIRED('Цена UAH');
      }
      if (!validatePrice(value)) {
        return VALIDATION_MESSAGES.PRICE_INVALID;
      }
      return null;
    }
  },
  guaranteeStart: {
    required: true,
    custom: (value: string) => {
      if (!value) {
        return VALIDATION_MESSAGES.REQUIRED('Дата начала гарантии');
      }
      if (!validateDate(value)) {
        return VALIDATION_MESSAGES.DATE_INVALID;
      }
      return null;
    }
  },
  guaranteeEnd: {
    required: true,
    custom: (value: string, allValues?: any) => {
      if (!value) {
        return VALIDATION_MESSAGES.REQUIRED('Дата окончания гарантии');
      }
      if (!validateDate(value)) {
        return VALIDATION_MESSAGES.DATE_INVALID;
      }
      if (allValues?.guaranteeStart) {
        const startDate = new Date(allValues.guaranteeStart);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          return 'Дата окончания гарантии должна быть позже даты начала';
        }
      }
      return null;
    }
  }
} as const;

export const ORDER_VALIDATION_CONFIG = {
  title: {
    required: true,
    minLength: VALIDATION_LIMITS.TITLE_MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.TITLE_MAX_LENGTH,
    custom: (value: string) => {
      if (!value?.trim()) {
        return VALIDATION_MESSAGES.REQUIRED('Название прихода');
      }
      return null;
    }
  },
  description: {
    required: true,
    minLength: 5,
    maxLength: VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH,
    custom: (value: string) => {
      if (!value?.trim()) {
        return VALIDATION_MESSAGES.REQUIRED('Описание');
      }
      return null;
    }
  },
  date: {
    required: true,
    custom: (value: string) => {
      if (!value) {
        return VALIDATION_MESSAGES.REQUIRED('Дата прихода');
      }
      if (!validateDate(value)) {
        return VALIDATION_MESSAGES.DATE_INVALID;
      }
      if (!validatePastDate(value)) {
        return VALIDATION_MESSAGES.DATE_FUTURE;
      }
      return null;
    }
  }
} as const;

// 🌍 Простые функции для мультиязычности
export const getUkrainianMessage = {
  required: (field: string) => `${field} обов'язково для заповнення`,
  emailInvalid: () => 'Введіть коректний email адрес',
  passwordWeak: () => 'Пароль повинен містити мінімум 6 символів, включаючи літери та цифри',
  passwordsNotMatch: () => 'Паролі не співпадають',
  nameInvalid: () => 'Ім\'я повинно містити тільки літери та пробіли',
  nameFullRequired: () => 'Введіть ім\'я та прізвище',
  minLength: (field: string, length: number) => `${field} повинно містити мінімум ${length} символів`,
  maxLength: (field: string, length: number) => `${field} повинно містити максимум ${length} символів`,
};

export const getRussianMessage = {
  required: (field: string) => `${field} обязательно для заполнения`,
  emailInvalid: () => 'Введите корректный email адрес',
  passwordWeak: () => 'Пароль должен содержать минимум 6 символов, включая буквы и цифры',
  passwordsNotMatch: () => 'Пароли не совпадают',
  nameInvalid: () => 'Имя должно содержать только буквы и пробелы',
  nameFullRequired: () => 'Введите имя и фамилию',
  minLength: (field: string, length: number) => `${field} должно содержать минимум ${length} символов`,
  maxLength: (field: string, length: number) => `${field} должно содержать максимум ${length} символов`,
};

// 🧪 Тестовые украинские имена для проверки
export const testUkrainianNames = [
  "Іван Петренко",      // ✅ українське і
  "Марія Гончарук",     // ✅ звичайне
  "Гнат Михайлів",      // ✅ українське г
  "Оксана Єрмак",       // ✅ українське є  
  "Ігор Щербина",       // ✅ українське і та щ
  "Софія Кривенко",     // ✅ українське і
  "Тарас Карпенко",     // ✅ звичайне
  "Олексій Мельник"     // ✅ звичайне
];

// Функция для тестирования валидации украинских имен
export const testUkrainianValidation = () => {
  console.log('🇺🇦 Тест українських імен:');
  testUkrainianNames.forEach(name => {
    const isValid = EXTENDED_CYRILLIC.test(name);
    console.log(`${name}: ${isValid ? '✅' : '❌'}`);
  });
};

// 🎯 Экспорт всех валидационных функций для удобства
export const validators = {
  email: validateEmail,
  required: validateRequired,
  minLength: validateMinLength,
  maxLength: validateMaxLength,
  password: validatePassword,
  strongPassword: validateStrongPassword,
  phone: validatePhone,
  url: validateUrl,
  name: validateName,
  fullName: validateFullName,
  serialNumber: validateSerialNumber,
  price: validatePrice,
  date: validateDate,
  futureDate: validateFutureDate,
  pastDate: validatePastDate,
  file: validateFile
} as const;
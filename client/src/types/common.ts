// client/src/types/common.ts
export interface Price {
  value: number;
  symbol: string;
  isDefault: 0 | 1;
}

export interface Guarantee {
  start: string;
  end: string;
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

// Типы для состояния загрузки
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

// Типы для операций CRUD
export interface CrudOperations<T> {
  create: (data: Omit<T, 'id'>) => Promise<T>;
  read: (id: string | number) => Promise<T>;
  update: (id: string | number, data: Partial<T>) => Promise<T>;
  delete: (id: string | number) => Promise<void>;
  list: () => Promise<T[]>;
}

// Типы для форм
export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  submitError?: string;
}

// Типы для валидации
export type ValidationRule<T> = (value: T) => string | undefined;

export interface FieldValidation<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: ValidationRule<T>;
}

export interface ValidationConfig<T> {
  [K in keyof T]?: FieldValidation<T[K]>;
}

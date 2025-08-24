// client/src/types/auth.ts - УЛУЧШЕННАЯ ВЕРСИЯ
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Типы для API ответов
export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
  message?: string;
}

export interface LoginResponse extends AuthResponse {}

export interface RegisterResponse extends AuthResponse {}

// Типы для валидации форм аутентификации
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// Типы для состояний аутентификации
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// Типы для JWT токенов
export interface JWTPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

// Типы для ошибок аутентификации
export interface AuthError {
  type: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'EMAIL_EXISTS' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
  message: string;
  field?: string;
}

// Типы для настроек аутентификации
export interface AuthConfig {
  tokenStorageKey: string;
  userStorageKey: string;
  apiUrl: string;
  tokenExpirationBuffer: number; // в минутах
}

// Утилитарные типы
export type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS' }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

export type RequireAuth<T> = T & {
  user: NonNullable<User>;
  token: NonNullable<string>;
  isAuthenticated: true;
};

// Типы для хранения в localStorage
export interface StoredAuthData {
  user: User;
  token: string;
  expiresAt: number;
}

// Типы для middleware аутентификации
export interface AuthMiddlewareConfig {
  publicRoutes: string[];
  protectedRoutes: string[];
  redirectTo: string;
  redirectAuthenticated: string;
}
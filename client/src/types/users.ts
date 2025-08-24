// client/src/types/users.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Интерфейс для Redux slice состояния
export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  operations: {
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    fetching: boolean;
  };
  // Ошибки по операциям
  errors: {
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;
    fetchError: string | null;
  };
  // Дополнительные поля
  selectedUserId: number | null;
  successMessage: string | null;
}


// Фильтры и поиск
export interface UserFilters {
  role: UserRole | 'all';
  searchQuery: string;
  sortBy: keyof User;
  sortOrder: 'asc' | 'desc';
}

// Pагинация
export interface UsersPagination {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Селекторы (типы для возвращаемых значений)
export interface UsersListProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onUserSelect: (user: User) => void;
  onUserDelete: (userId: number) => Promise<void>;
  onUserEdit: (user: User) => void;
  currentUserId?: number;
}

// Интерфейс для компонента страницы
export interface UsersPageState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export interface UserStatistics {
  totalUsers: number;
  adminUsers: number;
  managerUsers: number;
  regularUsers: number;
}

// Типы для форм и API запросов
export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  // password не включаем в update, для этого отдельный endpoint
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Типы для валидации форм
export interface UserFormErrors {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
}

export interface UserFormData extends CreateUserRequest {
  confirmPassword: string;
}

// Константы для ролей
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ADMIN]: 'Администратор',
  [USER_ROLES.MANAGER]: 'Менеджер',
  [USER_ROLES.USER]: 'Пользователь'
};

export const USER_ROLE_COLORS: Record<string, string> = {
  [USER_ROLES.ADMIN]: 'bg-danger text-white',
  [USER_ROLES.MANAGER]: 'bg-warning text-dark',
  [USER_ROLES.USER]: 'bg-light text-dark border'
};

// Утилиты для работы с пользователями
export const getRoleLabel = (role: string): string => {
  return USER_ROLE_LABELS[role] || role;
};

export const getRoleColor = (role: string): string => {
  return USER_ROLE_COLORS[role] || 'bg-light text-dark border';
};

export const calculateUserStatistics = (users: User[]): UserStatistics => {
  return {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.role === USER_ROLES.ADMIN).length,
    managerUsers: users.filter(u => u.role === USER_ROLES.MANAGER).length,
    regularUsers: users.filter(u => u.role === USER_ROLES.USER).length
  };
};

// Дополнительные утилиты
export const isAdmin = (user: User): boolean => {
  return user.role === USER_ROLES.ADMIN;
};

export const isManager = (user: User): boolean => {
  return user.role === USER_ROLES.MANAGER;
};

export const canEditUsers = (user: User): boolean => {
  return isAdmin(user) || isManager(user);
};
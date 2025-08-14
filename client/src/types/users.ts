export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Новые интерфейсы для пользователей
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

// Константы для ролей
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
} as const;

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
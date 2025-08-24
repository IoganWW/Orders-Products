// client/src/hooks/useUsers.ts - НОВЫЙ ФАЙЛ
import { useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from './useTypedSelector';
import { 
  fetchUsers, 
  deleteUser, 
  updateUser, 
  createUser,
  clearError,
  clearSuccessMessage 
} from '@/store/slices/usersSlice';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '@/types/users';

// Типизированный хук для работы с пользователями
export const useUsers = () => {
  const dispatch = useAppDispatch();
  
  const {
    users,
    loading,
    error,
    operations: { deleting },
    errors: { deleteError },
    successMessage
  } = useAppSelector(state => state.users);

  // Мемоизированные селекторы
  const usersCount = useMemo(() => users.length, [users.length]);
  
  const usersByRole = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [users]);

  // Действия
  const loadUsers = useCallback(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const removeUser = useCallback((userId: number) => {
    return dispatch(deleteUser(userId));
  }, [dispatch]);

  const editUser = useCallback((id: number, userData: UpdateUserRequest) => {
    return dispatch(updateUser({ id, userData }));
  }, [dispatch]);

  const addUser = useCallback((userData: CreateUserRequest) => {
    return dispatch(createUser(userData));
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuccess = useCallback(() => {
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  const getUserById = useCallback((id: number): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  const filterUsers = useCallback((filters: Partial<UserFilters>): User[] => {
    return users.filter(user => {
      if (filters.role && filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(query) || 
               user.email.toLowerCase().includes(query);
      }
      return true;
    });
  }, [users]);

  return {
    // Данные
    users,
    usersCount,
    usersByRole,
    
    // Состояние
    loading,
    error,
    deleting,
    deleteError,
    successMessage,
    
    // Действия
    loadUsers,
    removeUser,
    editUser,
    addUser,
    clearErrors,
    clearSuccess,
    
    // Утилиты
    getUserById,
    filterUsers
  };
};
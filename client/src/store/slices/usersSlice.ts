// client/src/store/slices/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UsersState, User, UserRole } from '@/types/users';
import { showNotification } from '@/components/UI/Notifications';
import { ApiError } from '@/types/api';
import api from '@/services/api';


// Дополнительные типы для thunk параметров
interface UpdateUserParams {
  id: number;
  userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
}

// Тип для создания пользователя с обязательным паролем
type CreateUserData = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
  password: string;
  role: UserRole;
};


// Async thunks
export const fetchUsers = createAsyncThunk<
  User[], // return type
  void, // argument type
  {
    rejectValue: string;
  }
>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Failed to fetch users');
    }
  }
);

export const deleteUser = createAsyncThunk<
  number, // return type (userId)
  number, // argument type (userId)
  {
    rejectValue: string;
  }
>(
  'users/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      
      // Показываем уведомление об успехе
      showNotification({
        type: 'success',
        message: response.data?.message || 'Пользователь успешно удален!',
        duration: 4000
      });
      
      return userId;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Ошибка при удалении пользователя';
      
      // Показываем уведомление об ошибке
      showNotification({
        type: 'error',
        message: errorMessage,
        duration: 5000
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const getUserById = createAsyncThunk<
  User, // return type
  number, // argument type (userId)
  {
    rejectValue: string;
  }
>(
  'users/getUserById',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk<
  User, // return type
  UpdateUserParams, // argument type
  {
    rejectValue: string;
  }
>(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      
      showNotification({
        type: 'success',
        message: 'Пользователь успешно обновлен!',
        duration: 3000
      });

      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Failed to update user';
      
      showNotification({
        type: 'error',
        message: errorMessage,
        duration: 4000
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const createUser = createAsyncThunk<
  User, // return type
  CreateUserData, // argument type
  {
    rejectValue: string;
  }
>(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/users', userData);
      
      showNotification({
        type: 'success',
        message: 'Пользователь успешно создан!',
        duration: 3000
      });

      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Failed to create user';
      
      showNotification({
        type: 'error',
        message: errorMessage,
        duration: 4000
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: UsersState = { 
  users: [],
  loading: false,
  error: null,
  operations: {
    creating: false,
    updating: false,
    deleting: false,
    fetching: false,
  },
  errors: {
    createError: null,
    updateError: null,
    deleteError: null,
    fetchError: null,
  },
  selectedUserId: null,
  successMessage: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state): void => {
      state.error = null;
      state.errors.deleteError = null;
      state.errors.createError = null;
      state.errors.updateError = null;
      state.errors.fetchError = null;
    },
    clearSuccessMessage: (state): void => {
      state.successMessage = null;
    },
    setUsers: (state, action: PayloadAction<User[]>): void => {
      state.users = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>): void => {
      state.loading = action.payload;
      state.operations.fetching = action.payload;
    },
    setDeleting: (state, action: PayloadAction<boolean>): void => {
      state.operations.deleting = action.payload;
    },
    updateUserInList: (state, action: PayloadAction<User>): void => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUserFromList: (state, action: PayloadAction<number>): void => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operations.fetching = true;
        state.errors.fetchError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
        state.operations.fetching = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error occurred';
        state.operations.fetching = false;
        state.errors.fetchError = action.payload ?? 'Unknown error occurred';
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.operations.deleting = true;
        state.errors.deleteError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.operations.deleting = false;
        state.errors.deleteError = null;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.operations.deleting = false;
        state.errors.deleteError = action.payload ?? 'Unknown error occurred';
      })
      
      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operations.fetching = true;
      })
      .addCase(getUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.error = null;
        state.operations.fetching = false;

        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error occurred';
        state.operations.fetching = false;
        state.errors.fetchError = action.payload ?? 'Unknown error occurred';
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operations.updating = true;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.error = null;
        state.operations.updating = false;

        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error occurred';
        state.operations.updating = false;
        state.errors.updateError = action.payload ?? 'Unknown error occurred';
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.operations.creating = true;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.error = null;
        state.operations.creating = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error occurred';
        state.operations.creating = false;
        state.errors.createError = action.payload ?? 'Unknown error occurred';
      });
  },
});

export const { 
  clearError, 
  clearSuccessMessage, 
  setUsers, 
  setLoading,
  setDeleting,
  updateUserInList,
  removeUserFromList 
} = usersSlice.actions;

export type UsersSliceActions = typeof usersSlice.actions;
export default usersSlice.reducer;
// client/src/store/slices/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UsersState, User } from '@/types/users';
import api from '@/services/api';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users');
      return response.data; // interceptor уже извлек data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      
      // Показываем уведомление об успехе
      const successEvent = new CustomEvent('showNotification', {
        detail: { 
          type: 'success', 
          message: response.data?.message || 'Пользователь успешно удален!',
          duration: 4000
        }
      });
      window.dispatchEvent(successEvent);
      
      return userId;
    } catch (error: any) {
      // Показываем уведомление об ошибке
      const errorEvent = new CustomEvent('showNotification', {
        detail: { 
          type: 'error', 
          message: error.message || 'Ошибка при удалении пользователя',
          duration: 5000
        }
      });
      window.dispatchEvent(errorEvent);
      
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: number; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/users', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  deleting: false,
  deleteError: null,
  successMessage: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.deleteError = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete user - улучшенная обработка
      .addCase(deleteUser.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleting = false;
        state.deleteError = null;
        // Удаляем пользователя из списка
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload as string;
      })
      
      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage, setUsers } = usersSlice.actions;
export default usersSlice.reducer;
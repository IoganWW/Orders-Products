// client/src/store/__tests__/authSlice.test.ts
import { 
  setupStore, 
  type TestStore, 
  type MockRootState,
  mockUser,
  clearAuthError, 
  setAuthFromStorage
} from '@/test-utils/test-utils';

import authReducer, { 
  loginUser, 
  logoutUser, 
  initializeAuth,
} from '../slices/authSlice';

import { AuthState } from '@/types/auth';
import axios from 'axios';
import api from '@/services/api';


// Мокаем axios и api
jest.mock('axios');
jest.mock('@/services/api');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedApi = api as jest.Mocked<typeof api>;

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};


describe('authSlice', () => {
  let store: TestStore

  beforeEach(() => {
    store = setupStore()
  })

  it('should have correct initial state', () => {
    const state = store.getState()
    expect(state.auth.user).toBeNull()
    expect(state.auth.token).toBeNull()
    expect(state.auth.isAuthenticated).toBe(false)
    expect(state.auth.loading).toBe(true) // В реальном authSlice loading изначально true
    expect(state.auth.error).toBeNull()
  })

  it('should clear error', () => {
    const preloadedState: Partial<MockRootState> = {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Test error'
      }
    }

    const storeWithError = setupStore(preloadedState)
    storeWithError.dispatch(clearAuthError())
    
    const state = storeWithError.getState()
    expect(state.auth.error).toBeNull()
  })

  it('should set auth from storage', () => {
    const authData = {
      user: mockUser,
      token: 'test-token'
    }

    store.dispatch(setAuthFromStorage(authData))
    
    const state = store.getState()
    expect(state.auth.user).toEqual(mockUser)
    expect(state.auth.token).toBe('test-token')
    expect(state.auth.isAuthenticated).toBe(true)
    expect(state.auth.loading).toBe(false)
  })

  it('should handle user authentication state correctly', () => {
    // Начальное состояние - не авторизован
    let state = store.getState()
    expect(state.auth.isAuthenticated).toBe(false)
    expect(state.auth.user).toBeNull()

    // После авторизации
    store.dispatch(setAuthFromStorage({
      user: mockUser,
      token: 'auth-token'
    }))

    state = store.getState()
    expect(state.auth.isAuthenticated).toBe(true)
    expect(state.auth.user).toEqual(mockUser)
    expect(state.auth.token).toBe('auth-token')
  })

  it('should maintain auth state after clearing error', () => {
    // Устанавливаем авторизованное состояние с ошибкой
    const preloadedState: Partial<MockRootState> = {
      auth: {
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: 'Some error'
      }
    }

    const storeWithAuth = setupStore(preloadedState)
    storeWithAuth.dispatch(clearAuthError())
    
    const state = storeWithAuth.getState()
    expect(state.auth.error).toBeNull()
    expect(state.auth.user).toEqual(mockUser)
    expect(state.auth.token).toBe('test-token')
    expect(state.auth.isAuthenticated).toBe(true)
  })

  describe('extraReducers', () => {
    // --- Тесты для loginUser ---
    describe('loginUser', () => {
      it('should set loading true on pending', () => {
        const action = { type: loginUser.pending.type };
        const state = authReducer(initialState, action);
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
      });

      it('should set user, token and isAuthenticated on fulfilled', () => {
        const payload = { user: mockUser, token: 'new-token' };
        const action = { type: loginUser.fulfilled.type, payload };
        const state = authReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('new-token');
      });

      it('should set error on rejected', () => {
        const payload = 'Invalid credentials';
        const action = { type: loginUser.rejected.type, payload };
        const state = authReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBe(payload);
      });
    });

    // --- Тесты для logoutUser ---
    describe('logoutUser', () => {
      it('should reset state on fulfilled', () => {
        const loggedInState: AuthState = { ...initialState, user: mockUser, token: 'token', isAuthenticated: true };
        const action = { type: logoutUser.fulfilled.type };
        const state = authReducer(loggedInState, action);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
      });
    });

    // --- Тесты для initializeAuth ---
    describe('initializeAuth', () => {
      it('should restore auth state on fulfilled with payload', () => {
        const payload = { user: mockUser, token: 'stored-token' };
        const action = { type: initializeAuth.fulfilled.type, payload };
        const state = authReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('stored-token');
      });

      it('should do nothing on fulfilled with null payload', () => {
        const action = { type: initializeAuth.fulfilled.type, payload: null };
        const state = authReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
      });
    });
  });
})
// client/src/store/__tests__/authSlice.test.ts
import { 
  setupStore, 
  type TestStore, 
  type MockRootState,
  mockUser,
  clearAuthError, 
  setAuthFromStorage
} from '@/test-utils/test-utils'

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
})
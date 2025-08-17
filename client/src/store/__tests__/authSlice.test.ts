// client/src/store/__tests__/authSlice.test.ts
import { setupStore, type TestStore, mockUser } from '@/test-utils/test-utils'
import { clearError, setAuthFromStorage } from '../slices/authSlice'

describe('authSlice', () => {
  let store: TestStore

  beforeEach(() => {
    store = setupStore()
  })

  it('should handle clearError', () => {
    // Создаем store с ошибкой
    const storeWithError = setupStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Test error'
      }
    })

    storeWithError.dispatch(clearError())
    
    const state = storeWithError.getState()
    expect(state.auth.error).toBeNull()
  })

  it('should handle setAuthFromStorage', () => {
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

  it('should have correct initial state', () => {
    const state = store.getState()
    
    expect(state.auth.user).toBeNull()
    expect(state.auth.token).toBeNull()
    expect(state.auth.isAuthenticated).toBe(false)
    expect(state.auth.loading).toBe(true)
    expect(state.auth.error).toBeNull()
  })
})
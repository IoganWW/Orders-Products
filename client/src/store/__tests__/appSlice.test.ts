// client/src/store/__tests__/appSlice.test.ts
import { setupStore, type TestStore } from '@/test-utils/test-utils'
import { 
  setActiveSessions, 
  setCurrentTime, 
  setConnectionStatus, 
  toggleTheme, 
  setLocale 
} from '../slices/appSlice'

describe('appSlice', () => {
  let store: TestStore

  beforeEach(() => {
    store = setupStore()
  })

  it('should handle setActiveSessions', () => {
    store.dispatch(setActiveSessions(5))
    
    const state = store.getState()
    expect(state.app.activeSessions).toBe(5)
  })

  it('should handle setConnectionStatus', () => {
    store.dispatch(setConnectionStatus(true))
    
    const state = store.getState()
    expect(state.app.isConnected).toBe(true)
  })

  it('should handle toggleTheme', () => {
    const initialTheme = store.getState().app.theme
    store.dispatch(toggleTheme())
    
    const newTheme = store.getState().app.theme
    expect(newTheme).not.toBe(initialTheme)
  })

  it('should handle setLocale', () => {
    store.dispatch(setLocale('uk'))
    
    const state = store.getState()
    expect(state.app.locale).toBe('uk')
  })

  it('should handle setCurrentTime', () => {
    const testDate = new Date('2024-01-01')
    store.dispatch(setCurrentTime(testDate))
    
    const state = store.getState()
    expect(state.app.currentTime).toEqual(testDate)
  })
})
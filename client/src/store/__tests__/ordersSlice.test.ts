// client/src/store/__tests__/ordersSlice.test.ts
import { 
  setupStore, 
  type TestStore, 
  type MockRootState,
  mockOrder, 
  setSelectedOrder, 
  clearError 
} from '@/test-utils/test-utils'

describe('ordersSlice', () => {
  let store: TestStore

  beforeEach(() => {
    store = setupStore()
  })

  it('should handle setSelectedOrder', () => {
    store.dispatch(setSelectedOrder(mockOrder))
    
    const state = store.getState()
    expect(state.orders.selectedOrder).toEqual(mockOrder)
  })

  it('should handle setSelectedOrder with null', () => {
    store.dispatch(setSelectedOrder(mockOrder))
    store.dispatch(setSelectedOrder(null))
    
    const state = store.getState()
    expect(state.orders.selectedOrder).toBeNull()
  })

  it('should handle clearError', () => {
    // Создаем store с ошибкой в preloadedState
    const preloadedState: Partial<MockRootState> = {
      orders: {
        orders: [],
        selectedOrder: null,
        loading: false,
        error: 'Test error'
      }
    }

    const storeWithError = setupStore(preloadedState)
    storeWithError.dispatch(clearError())
    
    const state = storeWithError.getState()
    expect(state.orders.error).toBeNull()
  })

  it('should have correct initial state', () => {
    const state = store.getState()
    expect(state.orders).toEqual({
      orders: [],
      selectedOrder: null,
      loading: false,
      error: null
    })
  })

  it('should handle multiple orders in state', () => {
    const secondOrder = { ...mockOrder, id: 2, title: 'Second Order' }
    
    const preloadedState: Partial<MockRootState> = {
      orders: {
        orders: [mockOrder, secondOrder],
        selectedOrder: null,
        loading: false,
        error: null
      }
    }

    const storeWithOrders = setupStore(preloadedState)
    const state = storeWithOrders.getState()
    
    expect(state.orders.orders).toHaveLength(2)
    expect(state.orders.orders[0]).toEqual(mockOrder)
    expect(state.orders.orders[1]).toEqual(secondOrder)
  })
})
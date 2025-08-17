// client/src/store/__tests__/ordersSlice.test.ts
import { setupStore, type TestStore, mockOrder } from '@/test-utils/test-utils'
import { setSelectedOrder, clearError } from '../slices/ordersSlice'
import type { OrdersState } from '@/types/orders'

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
    const storeWithError = setupStore({
      orders: {
        orders: [],
        selectedOrder: null,
        loading: false,
        error: 'Test error'
      }
    })

    storeWithError.dispatch(clearError())
    
    const state = storeWithError.getState()
    expect(state.orders.error).toBeNull()
  })
})
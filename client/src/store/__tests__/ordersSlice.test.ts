// client/src/store/__tests__/ordersSlice.test.ts
import { 
  setupStore, 
  type TestStore, 
  type MockRootState,
  mockOrder, 
  setSelectedOrder, 
  clearError 
} from '@/test-utils/test-utils';

import ordersReducer, { fetchOrders, deleteOrder } from '../slices/ordersSlice';
import { OrdersState } from '@/types/orders';

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

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

  describe('extraReducers', () => {
    // --- Тесты для fetchOrders ---
    describe('fetchOrders', () => {
      it('should set loading true on pending', () => {
        const action = { type: fetchOrders.pending.type };
        const state = ordersReducer(initialState, action);
        expect(state.loading).toBe(true);
      });

      it('should set orders on fulfilled', () => {
        const orders = [mockOrder];
        const action = { type: fetchOrders.fulfilled.type, payload: orders };
        const state = ordersReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.orders).toEqual(orders);
      });

      it('should set error on rejected', () => {
        const action = { type: fetchOrders.rejected.type, error: { message: 'Failed to fetch' } };
        const state = ordersReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Failed to fetch');
      });
    });

    // --- Тесты для deleteOrder ---
    describe('deleteOrder', () => {
      const stateWithOrders: OrdersState = {
        ...initialState,
        orders: [mockOrder, { ...mockOrder, id: 2 }],
        selectedOrder: mockOrder,
      };

      it('should set loading true on pending', () => {
        const action = { type: deleteOrder.pending.type };
        const state = ordersReducer(stateWithOrders, action);
        expect(state.loading).toBe(true);
      });

      it('should remove order on fulfilled', () => {
        const action = { type: deleteOrder.fulfilled.type, payload: 1 };
        const state = ordersReducer(stateWithOrders, action);
        expect(state.loading).toBe(false);
        expect(state.orders.length).toBe(1);
        expect(state.orders[0].id).toBe(2);
        // Также проверяем, что selectedOrder сбрасывается
        expect(state.selectedOrder).toBeNull();
      });

      it('should set error on rejected', () => {
        const action = { type: deleteOrder.rejected.type, error: { message: 'Failed to delete' } };
        const state = ordersReducer(stateWithOrders, action);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Failed to delete');
      });
    });
  });
})
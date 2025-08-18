// client/src/store/slices/ordersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrdersState, Order } from '@/types/orders';
import api from '@/services/api';

// Async thunks - используем api вместо axios
// ordersSlice.ts - упрощенная версия
export const fetchOrders = createAsyncThunk(
 'orders/fetchOrders',
 async (_, { rejectWithValue }) => {
   try {
     const response = await api.get('/api/orders');
     return response.data; // interceptor уже обработал {success, data}
   } catch (error: any) {
     return rejectWithValue(error.message || 'Failed to fetch orders');
   }
 }
);

export const deleteOrder = createAsyncThunk(
 'orders/deleteOrder',
 async (orderId: number, { rejectWithValue }) => {
   try {
     await api.delete(`/api/orders/${orderId}`);
     return orderId; // Просто возвращаем ID
   } catch (error: any) {
     return rejectWithValue(error.message || 'Failed to delete order');
   }
 }
);

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order.id !== action.payload);
        if (state.selectedOrder && state.selectedOrder.id === action.payload) {
          state.selectedOrder = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete order';
      });
  },
});

export const { setSelectedOrder, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
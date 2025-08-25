// client/src/store/slices/ordersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrdersState, Order } from '@/types/orders';
import { showNotification } from '@/components/UI/Notifications';
import { ApiError } from '@/types/api';
import api from '@/services/api';

// Async thunks - используем api вместо axios
export const fetchOrders = createAsyncThunk(
 'orders/fetchOrders',
 async (_, { rejectWithValue }) => {
   try {
     const response = await api.get('/api/orders');
     return response.data; // interceptor уже обработал {success, data}
   } catch (error: unknown) {
     const apiError = error as ApiError;
     return rejectWithValue(apiError.message || 'Failed to fetch orders');
   }
 }
);

export const deleteOrder = createAsyncThunk(
 'orders/deleteOrder',
 async (orderId: number, { rejectWithValue }) => {
   try {
      const response = await api.delete(`/api/orders/${orderId}`);

      // Показываем уведомление об успехе
      showNotification({
        type: 'success',
        message: response.data?.message || 'Приход успешно удален!',
        duration: 4000
      });

     return orderId;
   } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Ошибка при удалении прихода';
            
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
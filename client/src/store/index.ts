import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import ordersSlice from './slices/ordersSlice';
import productsSlice from './slices/productsSlice';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    orders: ordersSlice,
    products: productsSlice,
    app: appSlice,
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['app/setCurrentTime'],
        ignoredPaths: ['app.currentTime'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные хуки
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
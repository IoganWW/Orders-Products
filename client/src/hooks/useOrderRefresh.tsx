// client/src/hooks/useOrderRefresh.ts
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedOrder } from '@/store/slices/ordersSlice';

export const useOrderRefresh = () => {
  const dispatch = useAppDispatch();
  const { orders, selectedOrder } = useAppSelector(state => state.orders);

  useEffect(() => {
    // Если есть выбранный заказ, обновляем его данными из обновленного списка
    if (selectedOrder && orders.length > 0) {
      const updatedSelectedOrder = orders.find(order => order.id === selectedOrder.id);
      if (updatedSelectedOrder) {
        // Проверяем, изменились ли данные (например, количество продуктов)
        if (updatedSelectedOrder.products.length !== selectedOrder.products.length) {
          dispatch(setSelectedOrder(updatedSelectedOrder));
        }
      }
    }
  }, [orders, selectedOrder, dispatch]);
};
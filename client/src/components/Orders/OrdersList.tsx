// client/src/components/Orders/OrdersList.tsx
'use client';

import React, { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchOrders, setSelectedOrder } from '@/store/slices/ordersSlice';
import { deleteProduct } from '@/store/slices/productsSlice';
import { useOrderRefresh } from '@/hooks/useOrderRefresh';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';
import styles from './Orders.module.css';
import { Order } from '@/types/orders';
import { useTranslation } from 'react-i18next';

import LoadingSpinner from '@/app/LoadingSpinner';
import ErrorMessage from '@/app/ErrorMessage';


// Компонент пустого состояния
const EmptyOrdersState: React.FC<{ onAddOrder: () => void }> = React.memo(({ onAddOrder }) => {
  const { t } = useTranslation(['orders']);
  return (
  <div className="text-center p-5 text-muted">
    <div className="mb-4">
      <i className="fas fa-inbox fa-4x opacity-25"></i>
    </div>
    <h5 className="text-muted mb-3">{t('oreders:noOrders')}</h5>
    <button
      className="btn btn-success"
      onClick={onAddOrder}
    >
      <i className="fa-sharp fa-solid fa-circle-plus me-2"></i>
      {t('orders:firstOrder')}
    </button>
  </div>
)});

EmptyOrdersState.displayName = 'EmptyOrdersState';

// Основной компонент
const OrdersList: React.FC = () => {
  const { t } = useTranslation(['products']);
  const dispatch = useAppDispatch();
  const { orders, selectedOrder, loading, error } = useAppSelector(state => state.orders);

  // Используем хук для автоматического обновления выбранного заказа
  useOrderRefresh();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Обработчик выбора заказа
  const handleOrderSelect = useCallback((order: Order) => {
    dispatch(setSelectedOrder(selectedOrder?.id === order.id ? null : order));
  }, [dispatch, selectedOrder?.id]);

  // Обработчик удаления продукта
  const handleDeleteProduct = useCallback(async (orderId: number, productId: number) => {
    try {
      console.log(`Удаляем продукт ID: ${productId} из заказа ID: ${orderId}`);

      // Удаляем продукт на сервере
      await dispatch(deleteProduct(productId)).unwrap();

      // Обновляем заказы
      await dispatch(fetchOrders()).unwrap();

      // Обновляем выбранный заказ
      if (selectedOrder) {
        const updatedOrders = await dispatch(fetchOrders()).unwrap();
        const updatedSelectedOrder = updatedOrders.find((order: Order) => order.id === selectedOrder.id);
        if (updatedSelectedOrder) {
          dispatch(setSelectedOrder(updatedSelectedOrder));
        }
      }

      // Показываем уведомление об успехе
      const successEvent = new CustomEvent('showNotification', {
        detail: { type: 'success', message: `${t('products:productDeletedSuccess')}` }
      });
      window.dispatchEvent(successEvent);

    } catch (error) {
      console.error('Error deleting product:', error);

      const errorEvent = new CustomEvent('showNotification', {
        detail: { type: 'error', message: `${t('products:productDeleteError')}` }
      });
      window.dispatchEvent(errorEvent);
    }
  }, [dispatch, selectedOrder, t]);

  const handleAddOrder = useCallback(() => {
    const event = new CustomEvent('showAddOrderForm');
    window.dispatchEvent(event);
  }, []);

  // Состояния загрузки и ошибок
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Колонка со списком заказов */}
        <div className={`${selectedOrder ? 'col-12 col-lg-5 col-xl-4' : 'col-12'}`}>
          <div className={`${styles.ordersList} ${selectedOrder ? styles['ordersList--detail-open'] : ''}`}>
            {orders.length === 0 ? (
              <EmptyOrdersState onAddOrder={handleAddOrder} />
            ) : (
              <div className="d-flex flex-column gap-2 py-3 px-2 px-md-3 ps-lg-5 pe-lg-3">
                {orders.map((order) => (
                  <div key={order.id} className="w-100">
                    <OrderCard
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onSelect={handleOrderSelect}
                      isDetailPanelOpen={!!selectedOrder}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Колонка с деталями заказа */}
        {selectedOrder && (
          <div className="col-12 col-lg-7 col-xl-8">
            <div className="p-3 h-100">
              <OrderDetails
                order={selectedOrder}
                onClose={() => dispatch(setSelectedOrder(null))}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(OrdersList);
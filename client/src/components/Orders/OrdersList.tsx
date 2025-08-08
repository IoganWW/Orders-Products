// client/src/components/Orders/OrdersList.tsx
'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchOrders, setSelectedOrder } from '@/store/slices/ordersSlice';
import { deleteProduct } from '@/store/slices/productsSlice';
import { useOrderRefresh } from '@/hooks/useOrderRefresh';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';
import styles from './Orders.module.css';
import { Order } from '@/types/orders';

const OrdersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, selectedOrder, loading, error } = useAppSelector(state => state.orders);
  
  // Используем хук для автоматического обновления выбранного заказа
  useOrderRefresh();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Handler for selecting/deselecting an order
  const handleOrderSelect = (order: Order) => {
    dispatch(setSelectedOrder(selectedOrder?.id === order.id ? null : order));
  };

  // Функции-обработчики для OrderDetails - ОБНОВЛЕНО для реального удаления
  const handleDeleteProduct = async (orderId: number, productId: number) => {
    try {
      console.log(`Удаляем продукт ID: ${productId} из заказа ID: ${orderId}`);
      
      // Удаляем продукт на сервере
      await dispatch(deleteProduct(productId)).unwrap();
      
      // Обновляем заказы
      await dispatch(fetchOrders()).unwrap();
      
      // Обновляем выбранный заказ, чтобы изменения сразу отобразились в OrderDetails
      if (selectedOrder) {
        const updatedOrders = await dispatch(fetchOrders()).unwrap();
        const updatedSelectedOrder = updatedOrders.find((order: Order) => order.id === selectedOrder.id);
        if (updatedSelectedOrder) {
          dispatch(setSelectedOrder(updatedSelectedOrder));
        }
      }
      
      // Показываем уведомление
      const successEvent = new CustomEvent('showNotification', {
        detail: { type: 'success', message: 'Продукт успешно удален!' }
      });
      window.dispatchEvent(successEvent);
      
    } catch (error) {
      console.error('Error deleting product:', error);
      
      const errorEvent = new CustomEvent('showNotification', {
        detail: { type: 'error', message: 'Ошибка при удалении продукта' }
      });
      window.dispatchEvent(errorEvent);
    }
  };

  const handleAddProduct = (orderId: number) => {
    console.log(`Добавлен продукт в заказ ID: ${orderId}`);
  };
  
  if (loading) {
    return (
      <div className={`${styles.loading} flex justify-center items-center h-full`}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.ordersContainer} orders-container`}>
      <div className="row px-5">
        <div className={selectedOrder ? 'col-md-4' : 'col-12'}>
          <div className={`${styles.ordersList} orders-list`}>
            {orders.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <i className="fas fa-inbox fa-3x mb-3"></i>
                <p>Нет приходов</p>
                <p className="small">Нажмите на иконку <i className="fa-sharp fa-solid fa-circle-plus fa-sm text-success"></i> в заголовке, чтобы создать первый приход</p>
              </div>
            ) : (
              <div className="row">
                <div className={`${styles.ordersList} ${selectedOrder ? styles['ordersList--detail-open'] : ''}`}>
                  {orders.map((order) => (
                    <div key={order.id} className="col-12 mb-2"> 
                      <OrderCard
                        order={order}
                        isSelected={selectedOrder?.id === order.id}
                        onSelect={handleOrderSelect}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {selectedOrder && (
          <div className="col-md-8">
            <OrderDetails
              order={selectedOrder}
              onClose={() => dispatch(setSelectedOrder(null))}
              onDeleteProduct={handleDeleteProduct}
              onAddProduct={handleAddProduct}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
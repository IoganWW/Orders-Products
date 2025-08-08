'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchOrders, setSelectedOrder } from '@/store/slices/ordersSlice';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';
import styles from './Orders.module.css';
import { Order } from '@/types/orders';

const OrdersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, selectedOrder, loading, error } = useAppSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Handler for selecting/deselecting an order
  const handleOrderSelect = (order: Order) => {
    dispatch(setSelectedOrder(selectedOrder?.id === order.id ? null : order));
  };

  // Функции-обработчики для OrderDetails
  const handleDeleteProduct = (orderId: number, productId: number) => {
    console.log(`Удален продукт ID: ${productId} из заказа ID: ${orderId}`);
    
    if (selectedOrder) {
      const updatedProducts = selectedOrder.products.filter(p => p.id !== productId);
      dispatch(setSelectedOrder({ ...selectedOrder, products: updatedProducts }));
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
      <div className="row">
        <div className={selectedOrder ? 'col-md-6' : 'col-12'}>
          <div className={`${styles.ordersList} orders-list`}>
            {orders.length === 0 ? (
              <div className="alert alert-info">
                <h5>No orders found</h5>
                <p>There are no orders to display at the moment.</p>
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
          <div className="col-md-6">
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
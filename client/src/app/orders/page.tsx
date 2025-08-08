'use client';

import React from 'react';
import OrdersList from '@/components/Orders/OrdersList';
import { useAppSelector } from '@/store';

export default function OrdersPage() {
  // Получаем количество заказов из Redux-хранилища для отображения в заголовке
  const ordersCount = useAppSelector(state => state.orders.orders.length);
  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">
          <i className="fa-sharp fa-solid fa-circle-plus fa-sm" style={{color:" #25b01c"}}></i>
          <span className="p-2">Orders / {ordersCount}</span>
        </h1>
      </div>

      <OrdersList />
    </div>
  );
}
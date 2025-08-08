'use client';

import React, { useState } from 'react';
import OrdersList from '@/components/Orders/OrdersList';
import AddOrderForm from '@/components/Orders/AddOrderForm';
import { useAppSelector } from '@/store';

export default function OrdersPage() {
  // Получаем количество заказов из Redux-хранилища для отображения в заголовке
  const ordersCount = useAppSelector(state => state.orders.orders.length);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">
          <i 
            className="fa-sharp fa-solid fa-circle-plus fa-sm" 
            style={{color:" #25b01c", cursor: "pointer"}}
            onClick={() => setShowAddForm(true)}
            title="Добавить новый приход"
          ></i>
          <span className="p-2">Orders / {ordersCount}</span>
        </h1>
      </div>

      <OrdersList />
      
      {/* Форма добавления заказа */}
      <AddOrderForm
        show={showAddForm}
        onClose={() => setShowAddForm(false)}
      />
    </div>
  );
}

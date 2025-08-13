'use client';

import React, { useState } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import OrdersList from '@/components/Orders/OrdersList';
import AddOrderForm from '@/components/Orders/AddOrderForm';
import { useAppSelector } from '@/store';

export default function OrdersPage() {
  // Получаем количество заказов из Redux-хранилища для отображения в заголовке
  const ordersCount = useAppSelector(state => state.orders.orders.length);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <AuthWrapper>
      <div className="page fade-in">
        <div className="page__header px-5">
          <h1 className="page__title px-3">
            <i
              className="fa-sharp fa-solid fa-circle-plus fa-sm"
              style={{ color: " #25b01c", cursor: "pointer" }}
              onClick={() => setShowAddForm(true)}
              title="Добавить новый приход"
            ></i>
            <span className="p-2">Приходы / {ordersCount}</span>
          </h1>
        </div>

        <OrdersList />

        {/* Форма добавления заказа */}
        <AddOrderForm
          show={showAddForm}
          onClose={() => setShowAddForm(false)}
        />
      </div>
    </AuthWrapper>
  );
}
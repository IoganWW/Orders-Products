'use client';

import React, { useState } from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import OrdersList from '@/components/Orders/OrdersList';
import AddOrderForm from '@/components/Orders/AddOrderForm';
import { useAppSelector } from '@/store';
import { useTranslation } from 'react-i18next';

export default function OrdersPage() {
  const { t } = useTranslation(['navigation', 'orders']);
  const ordersCount = useAppSelector(state => state.orders.orders.length);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <AuthWrapper>
      <div className="page fade-in">
        <div className="mt-4 px-1 px-md-3 px-lg-5 py-2 py-md-4">
          <h1 className="d-flex align-items-center">
            <i
              className="fa-sharp fa-solid fa-circle-plus fa-sm text-success me-2"
              style={{ cursor: "pointer" }}
              onClick={() => setShowAddForm(true)}
              title={t('orders:addOrder')}
            ></i>
            <span className="p-2 fs-3">{t('navigation:orders')} / {ordersCount}</span>
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
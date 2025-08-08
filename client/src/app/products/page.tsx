'use client';

import React from 'react';
import ProductsList from '@/components/Products/ProductsList';
import { useAppSelector } from '@/store';

export default function ProductsPage() {
  // Получаем количество заказов из Redux-хранилища для отображения в заголовке
  const productsCount = useAppSelector(state => state.products.products.length);
  return (
    <div className="page fade-in">
      <div className="page__header">
        <h1 className="page__title">
          <span>Products / {productsCount} </span>
        </h1>
      </div>

      <ProductsList />
    </div>
  );
}
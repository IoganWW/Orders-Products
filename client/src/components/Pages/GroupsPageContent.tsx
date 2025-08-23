
// client/src/app/groups/page.tsx
'use client';

import React, { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchProducts } from '@/store/slices/productsSlice';
import { createProductGroups } from '@/types/products';


import GroupsStatistics from '@/components/Pages/groups/GroupsStatistics';
import ProductGroupCard from '@/components/Pages/groups/ProductGroupCard';
import EmptyGroupsState from '@/components/Pages/groups/EmptyGroupsState';
import LoadingSpinner from '@/app/LoadingSpinner';
import ErrorMessage from '@/app/ErrorMessage';

// Основной компонент
export default function GroupsPageContent() {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(state => state.products);

  // Автоматически загружаем продукты при монтировании
  useEffect(() => {
    if (products.length === 0 && !loading) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length, loading]);

  // Мемоизированное создание групп
  const groups = useMemo(() => {
    return products.length > 0 ? createProductGroups(products) : [];
  }, [products]);

  // Состояния загрузки и ошибок
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="page fade-in">
      <div className="bg-light min-vh-100">
        <div className="container-fluid py-5 px-3 px-lg-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <h1 className="h3 fw-bold text-dark mb-1">Группы товаров</h1>
              <p className="text-muted mb-0 small">Категории и группировка продуктов</p>
            </div>
          </div>

          {/* Statistics */}
          <GroupsStatistics groups={groups} totalProducts={products.length} />

          {/* Groups Grid */}
          <div className="row g-3">
            {groups.length === 0 ? (
              <EmptyGroupsState />
            ) : (
              groups.map((group) => (
                <ProductGroupCard key={group.type} group={group} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// client/src/app/page.tsx
'use client';

import Link from 'next/link';
import { useAppSelector } from '@/store';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchOrders } from '@/store/slices/ordersSlice';
import { fetchProducts } from '@/store/slices/productsSlice';
import ProductsChart from '@/components/Charts/ProductsChart';
import SessionsChart from '@/components/Charts/SessionsChart';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector(state => state.orders);
  const { products } = useAppSelector(state => state.products);
  const { activeSessions, isConnected } = useAppSelector(state => state.app);
  const { isAuthenticated, loading: authLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Загружаем данные только если пользователь авторизован
    if (isAuthenticated && !authLoading) {
      dispatch(fetchOrders());
      dispatch(fetchProducts());
    }
  }, [dispatch, isAuthenticated, authLoading]);

  // Исправленное вычисление статистики
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + order.products.reduce((orderSum, product) => {
      const defaultPrice = product.price.find(p => p.isDefault === 1);
      const priceValue = parseFloat(defaultPrice?.value) || 0;
      return orderSum + priceValue;
    }, 0);
  }, 0);

  const newProductsCount = products.filter(p => p.isNew === 1).length;
  const usedProductsCount = products.filter(p => p.isNew === 0).length;
  const averageOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4 px-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3 fw-bold text-dark mb-1">Панель управления</h1>
            <p className="text-muted mb-0 small">Система управления приходами и продуктами</p>
          
            {!isAuthenticated && !authLoading && (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Для доступа к данным необходимо войти в систему
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-3 justify-content-start statistics-blocks">
              <div className="bg-white rounded px-3 py-2 border">
                <span className="text-muted small me-2">Приходы:</span>
                <span className="fw-bold">{isAuthenticated ? orders.length : '—'}</span>
                <Link href="/orders" className="btn btn-sm btn-outline-primary ms-2">
                  Управление
                </Link>
              </div>
              
              <div className="bg-white rounded px-3 py-2 border">
                <span className="text-muted small me-2">Продукты:</span>
                <span className="fw-bold">{isAuthenticated ? products.length : '—'}</span>
                <span className="text-muted small ms-2">(Новых: {newProductsCount}, Б/у: {usedProductsCount})</span>
                <Link href="/products" className="btn btn-sm btn-outline-success ms-2">
                  Каталог
                </Link>
              </div>
              
              <div className="bg-white rounded px-3 py-2 border">
                <span className="text-muted small me-2">Стоимость:</span>
                <span className="fw-bold">{totalRevenue.toLocaleString()} ₴</span>
                <span className="text-muted small ms-2">(Средний: {Math.round(averageOrder).toLocaleString()} ₴)</span>
              </div>
              
              <div className="bg-white rounded px-3 py-2 border">
                <span className="text-muted small me-2">Сессии:</span>
                <span className="fw-bold">{activeSessions}</span>
                <div 
                  className="d-inline-block rounded-circle ms-2 me-1" 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    backgroundColor: isConnected ? '#28a745' : '#dc3545' 
                  }}
                ></div>
                <span className="text-muted small">
                  {isConnected ? 'Онлайн' : 'Офлайн'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row g-3">
          <div className="col-lg-6">
            <ProductsChart className="h-100" />
          </div>
          <div className="col-lg-6">
            <SessionsChart className="h-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
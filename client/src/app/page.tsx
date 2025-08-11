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

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
  }, [dispatch]);

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
            <p className="text-muted mb-0 small">Система управления заказами и продуктами</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 h-100">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Заказы</p>
                    <h4 className="mb-0 fw-bold">{orders.length}</h4>
                  </div>
                  <div className="text-primary">
                    <i className="fas fa-shopping-cart fa-lg"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <Link href="/orders" className="btn btn-sm btn-outline-primary">
                    Управление
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 h-100">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Продукты</p>
                    <h4 className="mb-0 fw-bold">{products.length}</h4>
                    <small className="text-muted">Новых: {newProductsCount}</small>
                    <small className="text-muted ms-3">Б/у: {usedProductsCount}</small> 
                  </div>
                  <div className="text-success">
                    <i className="fas fa-boxes fa-lg"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <Link href="/products" className="btn btn-sm btn-outline-success">
                    Каталог
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 h-100">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Выручка</p>
                    <h4 className="mb-0 fw-bold">{totalRevenue.toLocaleString()} ₴</h4>
                    <small className="text-muted">Средний: {Math.round(averageOrder).toLocaleString()} ₴</small>
                  </div>
                  <div className="text-info">
                    <i className="fas fa-chart-line fa-lg"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 h-100">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Сессии</p>
                    <h4 className="mb-0 fw-bold">{activeSessions}</h4>
                    <div className="d-flex align-items-center mt-1">
                      <div 
                        className="rounded-circle me-1" 
                        style={{ 
                          width: '6px', 
                          height: '6px', 
                          backgroundColor: isConnected ? '#28a745' : '#dc3545' 
                        }}
                      ></div>
                      <small className="text-muted">
                        {isConnected ? 'Онлайн' : 'Офлайн'}
                      </small>
                    </div>
                  </div>
                  <div className="text-warning">
                    <i className="fas fa-users fa-lg"></i>
                  </div>
                </div>
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
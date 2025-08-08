'use client';

import Link from 'next/link';
import { useAppSelector } from '@/store';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchOrders } from '@/store/slices/ordersSlice';
import { fetchProducts } from '@/store/slices/productsSlice';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector(state => state.orders);
  const { products } = useAppSelector(state => state.products);
  const { activeSessions, isConnected } = useAppSelector(state => state.app);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="h-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="text-center">
        <div className="mb-5">
          <i className="fas fa-boxes fa-5x text-success mb-4"></i>
          <h1 className="display-4 fw-bold text-dark mb-3">
            Добро пожаловать в INVENTORY
          </h1>
          <p className="lead text-muted mb-4">
            Система управления приходами и продуктами
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="fas fa-clipboard-list fa-3x text-success"></i>
                </div>
                <h3 className="h4 mb-2">{orders.length}</h3>
                <p className="text-muted mb-3">Всего приходов</p>
                <Link href="/orders" className="btn btn-success btn-sm px-4">
                  Перейти к приходам
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className="fas fa-boxes fa-3x text-info"></i>
                </div>
                <h3 className="h4 mb-2">{products.length}</h3>
                <p className="text-muted mb-3">Всего продуктов</p>
                <Link href="/products" className="btn btn-info btn-sm px-4">
                  Перейти к продуктам
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '12px' }}>
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <i className={`fas fa-users fa-3x ${isConnected ? 'text-success' : 'text-danger'}`}></i>
                </div>
                <h3 className="h4 mb-2">{activeSessions}</h3>
                <p className="text-muted mb-3">Активных сессий</p>
                <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'} px-3 py-2`}>
                  {isConnected ? 'Онлайн' : 'Оффлайн'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-muted small">
            <i className="fas fa-info-circle me-1"></i>
            Используйте боковое меню для навигации по системе
          </p>
        </div>
      </div>
    </div>
  );
}

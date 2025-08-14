// client/src/app/groups/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchProducts } from '@/store/slices/productsSlice';

interface ProductGroup {
  type: string;
  count: number;
  description: string;
}

export default function GroupsPage() {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(state => state.products);
  const [groups, setGroups] = useState<ProductGroup[]>([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      // Группируем продукты по типам
      const groupedProducts = products.reduce((acc, product) => {
        const type = product.type;
        if (!acc[type]) {
          acc[type] = {
            type,
            count: 0,
            description: getTypeDescription(type)
          };
        }
        acc[type].count++;
        return acc;
      }, {} as { [key: string]: ProductGroup });

      setGroups(Object.values(groupedProducts));
    }
  }, [products]);

  const getTypeDescription = (type: string): string => {
    const descriptions: { [key: string]: string } = {
      'Monitors': 'LCD и LED мониторы различных размеров',
      'Laptops': 'Ноутбуки и портативные компьютеры',
      'Keyboards': 'Клавиатуры механические и мембранные',
      'Phones': 'Мобильные телефоны и смартфоны',
      'Tablets': 'Планшеты и электронные книги'
    };
    return descriptions[type] || 'Прочие товары';
  };

  const getTypeIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      'Monitors': 'fas fa-desktop',
      'Laptops': 'fas fa-laptop',
      'Keyboards': 'fas fa-keyboard',
      'Phones': 'fas fa-mobile-alt',
      'Tablets': 'fas fa-tablet-alt'
    };
    return icons[type] || 'fas fa-box';
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100">
        <div className="container-fluid py-4 px-5">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-light min-vh-100">
        <div className="container-fluid py-4 px-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Ошибка!</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-4 px-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3 fw-bold text-dark mb-1">Группы товаров</h1>
            <p className="text-muted mb-0 small">Категории и группировка продуктов</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-3 justify-content-start">
              <div className="bg-white rounded px-3 py-2 border">
                <span className="text-muted small me-2">Всего групп:</span>
                <span className="fw-bold">{groups.length}</span>
              </div>
              
              <div className="bg-white rounded px-3 py-2 border">
                <span className="text-muted small me-2">Общее количество товаров:</span>
                <span className="fw-bold">{products.length}</span>
              </div>
              
              <div className="bg-white rounded px-3 py-2 border">
                <button className="btn btn-sm btn-success border-0">
                  <i className="fas fa-plus me-1"></i>
                  Создать группу
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="row g-3">
          {groups.length === 0 ? (
            <div className="col-12">
              <div className="bg-white rounded border text-center py-5">
                <i className="fas fa-layer-group fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">Группы не найдены</h5>
                <p className="text-muted small">В системе пока нет групп товаров</p>
              </div>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.type} className="col-xl-3 col-lg-4 col-md-6">
                <div className="bg-white rounded border p-4 h-100">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded d-flex align-items-center justify-content-center me-3"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: '#f8f9fa',
                          border: '2px solid #e9ecef'
                        }}
                      >
                        <i className={`${getTypeIcon(group.type)} text-muted`}></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">{group.type}</h6>
                        <small className="text-muted">{group.count} товаров</small>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-outline-primary border-0">
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                  
                  <p className="text-muted small mb-3">{group.description}</p>
                  
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary border-0 flex-fill">
                      Просмотр
                    </button>
                    <button className="btn btn-sm btn-outline-danger border-0">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

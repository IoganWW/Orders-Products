'use client';
import React from 'react';
import { ProductGroup } from '@/types/products';
import ProductTypeIcon from '@/components/Products/ProductTypeIcon';

// Компонент группы товаров
const ProductGroupCard: React.FC<{ group: ProductGroup }> = React.memo(({ group }) => (
  <div className="col-xl-3 col-lg-4 col-md-6">
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
            <ProductTypeIcon type={group.type} />
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
));

ProductGroupCard.displayName = 'ProductGroupCard';
export default ProductGroupCard;
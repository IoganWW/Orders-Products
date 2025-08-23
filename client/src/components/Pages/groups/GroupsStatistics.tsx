'use client';
import React from 'react';
import { ProductGroup } from '@/types/products';

// Компонент статистики
const GroupsStatistics: React.FC<{ groups: ProductGroup[], totalProducts: number }> = React.memo(({
  groups,
  totalProducts
}) => (
  <div className="row mb-4">
    <div className="col-12">
      <div className="d-flex flex-wrap gap-3 justify-content-start">
        <div className="bg-white rounded px-3 py-2 border">
          <span className="text-muted small me-2">Всего групп:</span>
          <span className="fw-bold">{groups.length}</span>
        </div>

        <div className="bg-white rounded px-3 py-2 border">
          <span className="text-muted small me-2">Общее количество товаров:</span>
          <span className="fw-bold">{totalProducts}</span>
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
));

GroupsStatistics.displayName = 'GroupsStatistics';
export default GroupsStatistics;
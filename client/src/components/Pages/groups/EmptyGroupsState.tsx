'use client';
import React from 'react';


// Компонент пустых групп
const EmptyGroupsState: React.FC = React.memo(() => (
  <div className="col-12">
    <div className="bg-white rounded border text-center py-5">
      <i className="fas fa-layer-group fa-3x text-muted mb-3"></i>
      <h5 className="text-muted">Группы не найдены</h5>
      <p className="text-muted small">В системе пока нет групп товаров</p>
    </div>
  </div>
));

EmptyGroupsState.displayName = 'EmptyGroupsState';
export default EmptyGroupsState;
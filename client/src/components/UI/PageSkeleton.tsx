'use client';

import React from 'react';

const PageSkeleton: React.FC = () => (
  <div className="page fade-in">
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: '60vh' }}
    >
      <div className="text-center">
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Загрузка страницы...</p>
      </div>
    </div>
  </div>
);

export default PageSkeleton;

'use client';
import React from 'react';

export default function ErrorFallback() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center p-4">
      <h2 className="mb-3">Что-то пошло не так 😢</h2>
      <p className="text-muted mb-4">
        При загрузке страницы возникла ошибка. Попробуйте обновить страницу.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => window.location.reload()}
      >
        🔄 Перезагрузить
      </button>
    </div>
  );
}

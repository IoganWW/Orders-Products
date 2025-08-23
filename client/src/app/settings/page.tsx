// client/src/app/settings/page.tsx
'use client';

import React from 'react';

export default function SettingsPageContent() {
  return (
    <div className="page fade-in">
      <div className="bg-light min-vh-100">
        <div className="container-fluid py-5 px-3 px-lg-5">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <h1 className="h3 fw-bold text-dark mb-1">Настройки системы</h1>
              <p className="text-muted mb-0 small">Конфигурация и параметры приложения</p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="row g-4">
            {/* General Settings */}
            <div className="col-lg-6">
              <div className="bg-white rounded border p-4">
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-cog me-2 text-muted"></i>
                  Общие настройки
                </h5>

                <div className="mb-3">
                  <label className="form-label small text-muted">Название компании</label>
                  <input type="text" className="form-control" defaultValue="INVENTORY System" />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Email уведомлений</label>
                  <input type="email" className="form-control" defaultValue="admin@company.com" />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Валюта по умолчанию</label>
                  <select className="form-select">
                    <option value="UAH">Гривна (UAH)</option>
                    <option value="USD">Доллар (USD)</option>
                    <option value="EUR">Евро (EUR)</option>
                  </select>
                </div>

                <button className="btn btn-success btn-sm">
                  Сохранить изменения
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="col-lg-6">
              <div className="bg-white rounded border p-4">
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-shield-alt me-2 text-muted"></i>
                  Безопасность
                </h5>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-medium">Двухфакторная аутентификация</div>
                      <small className="text-muted">Дополнительная защита аккаунта</small>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-medium">Логирование действий</div>
                      <small className="text-muted">Сохранение истории операций</small>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Время сессии (минуты)</label>
                  <input type="number" className="form-control" defaultValue="60" />
                </div>

                <button className="btn btn-success btn-sm">
                  Применить настройки
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="col-12">
              <div className="bg-white rounded border p-4">
                <h5 className="fw-bold mb-3">
                  <i className="fas fa-info-circle me-2 text-muted"></i>
                  Информация о системе
                </h5>

                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="text-muted small">Версия приложения</div>
                    <div className="fw-bold">1.0.0</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-muted small">База данных</div>
                    <div className="fw-bold">MySQL 8.0</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-muted small">Запущено</div>
                    <div className="fw-bold">12.03.2024</div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="text-muted small">Статус</div>
                    <span className="badge bg-success">Работает</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
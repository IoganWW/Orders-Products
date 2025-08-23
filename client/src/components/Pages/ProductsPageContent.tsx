'use client';

import React from 'react';
import ProductsList from '@/components/Products/ProductsList';
import { useProductsPage } from '@/hooks/useProductsPage';
import { ProductType, PRODUCT_TYPE_LABELS } from '@/types/products';
import styles from '@/components/Products/Products.module.css';
import { useTranslation } from 'react-i18next';

export default function ProductsPageContent() {
  const { t } = useTranslation(['navigation', 'products']);
  const {
    products,
    selectedType,
    specificationFilter,
    uniqueSpecifications,
    getProductCount,
    handleTypeFilterChange,
    handleSpecificationFilterChange
  } = useProductsPage();

  const productsCount = products.length;
  const productTypes: (ProductType | 'all')[] = [
    'all',
    'monitors',
    'laptops',
    'keyboards',
    'phones',
    'tablets'
  ];

  return (
    <div className="page fade-in">
      <div className="mt-4 mt-lg-5 mb-3 px-1 px-md-4 px-lg-5">
        <div className="row align-items-center">
          {/* Заголовок */}
          <div className="col-xl-3 col-lg-12 mb-lg-3 mb-xl-0">
            <h1 className="px-0 mb-2 fs-3 text-nowrap">
              <span>{t('navigation:products')} / {productsCount}</span>
            </h1>
          </div>

          {/* Фильтры */}
          <div className="col-xl-9 col-lg-12 px-4">
            <div className="row g-3 justify-content-start">
              {/* фильтр по типу */}
              <div className="col-lg-6 col-12">
                <div className="d-flex align-items-center gap-2">
                  <label className={styles.filterLabel}>
                    {t('products:type')}:
                  </label>
                  <select
                    className={`form-select ${styles.filterSelect}`}
                    value={selectedType}
                    onChange={(e) => handleTypeFilterChange(e.target.value as ProductType | 'all')}
                  >
                    {productTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === 'all'
                          ? t('products:all')
                          : t(PRODUCT_TYPE_LABELS[type as ProductType])}
                        ({getProductCount(type)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* фильтр по спецификациям */}
              <div className="col-lg-6 col-12">
                <div className="d-flex align-items-center gap-2">
                  <label className={styles.filterLabel}>
                    {t('products:specifications')}:
                  </label>
                  <select
                    className={`form-select ${styles.filterSelect}`}
                    value={specificationFilter}
                    onChange={(e) => handleSpecificationFilterChange(e.target.value)}
                  >
                    {uniqueSpecifications.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec === 'all'
                          ? `${t('products:all')} ${t('products:specifications')}`
                          : spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductsList />
    </div>
  );
}

'use client';

import React from 'react';
import AuthWrapper from '@/components/Auth/AuthWrapper';
import ProductsList from '@/components/Products/ProductsList';
import { useAppSelector, useAppDispatch } from '@/store';
import { setProductFilter, setSpecificationFilter } from '@/store/slices/productsSlice';
import { ProductType } from '@/types/products';
import { PRODUCT_TYPE_LABELS } from '@/types/products';
import styles from '@/components/Products/Products.module.css';
import { useTranslation } from 'react-i18next';

export default function ProductsPage() {
  const { t } = useTranslation(['navigation', 'products']);
  const dispatch = useAppDispatch();
  const { products, selectedType, specificationFilter } = useAppSelector(state => state.products);
  const productsCount = products.length;

  const productTypes: (ProductType | 'all')[] = ['all', 'monitors', 'laptops', 'keyboards', 'phones', 'tablets'];

  // Получаем уникальные спецификации для фильтра
  const uniqueSpecifications = React.useMemo(() => {
    const specs = products.map(product => product.specification).filter(Boolean);
    return ['all', ...Array.from(new Set(specs))];
  }, [products]);

  // Обновите функцию getProductCount в page.tsx
  const getProductCount = (type: ProductType | 'all') => {
    // Фильтруем только по спецификациям, игнорируя фильтр типа
    const specFilteredProducts = products.filter(product => {
      const specMatch = specificationFilter === 'all' ||
        product.specification?.includes(specificationFilter);
      return specMatch;
    });

    if (type === 'all') return specFilteredProducts.length;

    // Теперь применяем фильтр по типу к отфильтрованным по спецификации
    return specFilteredProducts.filter(product => product.type === type).length;
  };

  const handleTypeFilterChange = (type: ProductType | 'all') => {
    dispatch(setProductFilter(type));
  };

  const handleSpecificationFilterChange = (specification: string) => {
    dispatch(setSpecificationFilter(specification));
  };

  return (
    <AuthWrapper>
      <div className="page fade-in">
        <div className="mt-4 mt-lg-5 mb-2 px-1 px-md-4 px-lg-5">
          <div className="row align-items-center">
            {/* Заголовок с количеством */}
            <div className="col-xl-3 col-lg-12 mb-lg-3 mb-xl-0">
              <h1 className="px-0 mb-2 px-0 px-md-2 fs-3 text-nowrap">
                <span>{t('navigation:products')} / {productsCount}</span>
              </h1>
            </div>

            {/* Фильтры */}
            <div className="col-xl-9 col-lg-12 px-4">
              <div className="row g-3 justify-content-start">
                {/* Фильтр по типу */}
                <div className="col-lg-6 col-12">
                  <div className="d-flex align-items-center gap-2">
                    <label className={styles.filterLabel}>{t('products:type')}:</label>
                    <select
                      className={`form-select ${styles.filterSelect}`}
                      value={selectedType}
                      onChange={(e) => handleTypeFilterChange(e.target.value as ProductType | 'all')}
                    >
                      {productTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === 'all' ? t('products:all') : t(PRODUCT_TYPE_LABELS[type as ProductType])}
                          ({getProductCount(type)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Фильтр по спецификациям */}
                <div className="col-lg-6 col-12">
                  <div className="d-flex align-items-center gap-2">
                    <label className={styles.filterLabel}>{t('products:specifications')}:</label>
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
    </AuthWrapper>
  );
}
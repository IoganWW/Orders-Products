'use client';

import React from 'react';
import ProductsList from '@/components/Products/ProductsList';
import { useAppSelector, useAppDispatch } from '@/store';
import { setProductFilter, setSpecificationFilter } from '@/store/slices/productsSlice';
import { ProductType } from '@/types/products';
import styles from '@/components/Products/Products.module.css';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, selectedType, specificationFilter } = useAppSelector(state => state.products);
  const productsCount = products.length;
  
  const productTypes: (ProductType | 'All')[] = ['All', 'Monitors', 'Laptops', 'Keyboards', 'Phones', 'Tablets'];
  
  // Получаем уникальные спецификации для фильтра
  const uniqueSpecifications = React.useMemo(() => {
    const specs = products.map(product => product.specification).filter(Boolean);
    return ['All', ...Array.from(new Set(specs))];
  }, [products]);

  const getProductCount = (type: ProductType | 'All') => {
    if (type === 'All') return products.length;
    return products.filter(product => product.type === type).length;
  };

  const handleTypeFilterChange = (type: ProductType | 'All') => {
    dispatch(setProductFilter(type));
  };

  const handleSpecificationFilterChange = (specification: string) => {
    dispatch(setSpecificationFilter(specification));
  };

  return (
    <div className="page fade-in">
      <div className="page__header px-5">
        <div className="row align-items-center">
          {/* Заголовок с количеством */}
          <div className="col-xl-3 col-lg-12 mb-lg-3 mb-xl-0">
            <h1 className="page__title mb-2 px-3">
              <span>Продукты / {productsCount}</span>
            </h1>
          </div>
          
          {/* Фильтры */}
          <div className="col-xl-9 col-lg-12 px-4">
            <div className="row g-3 justify-content-start">
              <div className="col-lg-6 col-12">
                <div className="d-flex align-items-center gap-2">
                  <label className={styles.filterLabel}>Тип:</label>
                  <select
                    className={`form-select ${styles.filterSelect}`}
                    value={selectedType}
                    onChange={(e) => handleTypeFilterChange(e.target.value as ProductType | 'All')}
                  >
                    {productTypes.map((type) => (
                      <option key={type} value={type}>
                        {type} ({getProductCount(type)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-lg-6 col-12">
                <div className="d-flex align-items-center gap-2">
                  <label className={styles.filterLabel}>Спецификация:</label>
                  <select
                    className={`form-select ${styles.filterSelect}`}
                    value={specificationFilter}
                    onChange={(e) => handleSpecificationFilterChange(e.target.value)}
                  >
                    {uniqueSpecifications.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec === 'All' ? 'All Specifications' : spec}
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
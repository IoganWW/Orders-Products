'use client';

import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setProductFilter, setSpecificationFilter } from '@/store/slices/productsSlice';
import { ProductType } from '@/types/products';

export const useProductsPage = () => {
  const dispatch = useAppDispatch();
  const {
    products,
    selectedType,
    specificationFilter,
    loading,
    error
  } = useAppSelector(state => state.products);

  // уникальные спецификации
  const uniqueSpecifications = useMemo(() => {
    const specs = products.map(product => product.specification).filter(Boolean);
    return ['all', ...Array.from(new Set(specs))];
  }, [products]);

  // подсчёт количества по фильтрам
  const getProductCount = useCallback((type: ProductType | 'all') => {
    const specFilteredProducts = products.filter(product => {
      const specMatch =
        specificationFilter === 'all' ||
        product.specification?.includes(specificationFilter);
      return specMatch;
    });

    if (type === 'all') return specFilteredProducts.length;
    return specFilteredProducts.filter(product => product.type === type).length;
  }, [products, specificationFilter]);

  // обработчики фильтров
  const handleTypeFilterChange = useCallback((type: ProductType | 'all') => {
    dispatch(setProductFilter(type));
  }, [dispatch]);

  const handleSpecificationFilterChange = useCallback((specification: string) => {
    dispatch(setSpecificationFilter(specification));
  }, [dispatch]);

  return {
    products,
    selectedType,
    specificationFilter,
    loading,
    error,
    uniqueSpecifications,
    getProductCount,
    handleTypeFilterChange,
    handleSpecificationFilterChange
  };
};

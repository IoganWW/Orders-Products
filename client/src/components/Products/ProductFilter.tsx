import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setProductFilter } from '@/store/slices/productsSlice';
import { ProductType } from '@/types/products';
import styles from './Products.module.css';

const ProductFilter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedType, products } = useAppSelector(state => state.products);

  const productTypes: (ProductType | 'All')[] = ['All', 'Monitors', 'Laptops', 'Keyboards', 'Phones', 'Tablets'];

  const getProductCount = (type: ProductType | 'All') => {
    if (type === 'All') return products.length;
    return products.filter(product => product.type === type).length;
  };

  const handleFilterChange = (type: ProductType | 'All') => {
    dispatch(setProductFilter(type));
  };

  return (
    <div className={`${styles.productFilter} product-filter`}>
      <select
        className="form-select"
        value={selectedType}
        onChange={(e) => handleFilterChange(e.target.value as ProductType | 'All')}
      >
        {productTypes.map((type) => (
          <option key={type} value={type}>
            {type} ({getProductCount(type)})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProductFilter;
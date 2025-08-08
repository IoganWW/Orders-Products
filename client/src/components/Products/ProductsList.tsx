'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchProducts } from '@/store/slices/productsSlice';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';
import styles from './Products.module.css';

const ProductsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filteredProducts, loading, error, selectedType } = useAppSelector(state => state.products);
  const { orders } = useAppSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) {
    return (
      <div className={`${styles.loading} d-flex justify-content-center align-items-center`}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.productsContainer} products-container`}>
      <div className={`${styles.productsHeader} products-header`}>
        <div className="row align-items-center">
          <div className="col-md-8">
            <h5 className="mb-0">
              {selectedType === 'All' ? 'All Products' : `${selectedType}`}
            </h5>
          </div>
          <div className="col-md-4">
            <ProductFilter />
          </div>
        </div>
      </div>

      <div className={`${styles.productsList} products-list`}>
        {filteredProducts.length === 0 ? (
          <div className="alert alert-info text-center">
            <h5>No products found</h5>
            <p>
              {selectedType === 'All' 
                ? 'There are no products to display.' 
                : `No products found in ${selectedType} category.`
              }
            </p>
          </div>
        ) : (
          <div className="row">
            {filteredProducts.map((product) => {
              const orderTitle = orders.find(order => order.id === product.order)?.title || `Order #${product.order}`;
              
              return (
                <div key={product.id}>
                  <ProductCard 
                    product={product} 
                    orderTitle={orderTitle}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
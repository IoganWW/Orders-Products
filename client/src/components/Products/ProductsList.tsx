'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchProducts, deleteProduct } from '@/store/slices/productsSlice';
import ProductCard from './ProductCard';
import styles from './Products.module.css';

const ProductsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filteredProducts, loading, error, selectedType } = useAppSelector(state => state.products);
  const { orders } = useAppSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleDeleteProduct = async (productId: number) => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

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
    <div className={`${styles.productsContainer} ps-4 pe-1 px-lg-5`}>
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
          <div className="row g-1">
            {filteredProducts.map((product) => {
              const orderTitle = orders.find(order => order.id === product.order)?.title || `Order #${product.order}`;
              
              return (
                <div key={product.id} className="col-lg-12 col-md-6 col-sm-12 col-12">
                  <ProductCard 
                    product={product} 
                    orderTitle={orderTitle}
                    onDeleteProduct={handleDeleteProduct}
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
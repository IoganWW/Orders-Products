'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchProducts, deleteProduct } from '@/store/slices/productsSlice';
import ProductCard from './ProductCard';
import { useTranslation } from 'react-i18next';
import styles from './Products.module.css';

const ProductsList: React.FC = () => {
  const { t } = useTranslation(['common', 'products']);
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common:loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">{t('common:error')}</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-3 px-md-4 px-lg-5 w-100 overflow-auto" style={{ maxHeight: '65vh' }}>
      <div className={`${styles.productsList}`} style={{ width: '2200px', minWidth: '2200px' }}>
        {filteredProducts.length === 0 ? (
          <div className="alert alert-info text-start">
            <h5>{t('products:noProductsFound')}</h5>
            <p>
              {selectedType === 'all' 
                ? t('products:noProductsToDisplay')
                : `${t('products:noProductsInCategory')} ${selectedType}`
              }
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-1">
            {filteredProducts.map((product) => {
              const orderTitle = orders.find(order => order.id === product.order)?.title || `Order #${product.order}`;
              
              return (
                <ProductCard 
                  key={product.id}
                  product={product} 
                  orderTitle={orderTitle}
                  onDeleteProduct={handleDeleteProduct}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsList;
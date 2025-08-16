import React from 'react';
import { Product } from '@/types/products';
import styles from './Products.module.css';
import ProductTypeIcon from './ProductTypeIcon';

interface ProductItemMiniProps {
  product: Product;
}

const ProductItemMini: React.FC<ProductItemMiniProps> = ({ product }) => {

  return (
    <div className={`${styles.productItemMini}`}>
      <div className={`${styles.productCard__statusCircle} ${product.isNew === 1 ? styles.statusCircle__new : styles.statusCircle__used}`}></div>
      <ProductTypeIcon type={product.type} />
      <div className={`${styles.productCard__infoContainer}`}>
        <div className={`${styles.productCard__title} text-nowrap text-truncate`}>
          {product.title}
        </div>
        <div className={`${styles.productCard__serialNumber} text-truncate`}>
          SN-{product.serialNumber}
        </div>
      </div>
    </div>
  );
};

export default ProductItemMini;
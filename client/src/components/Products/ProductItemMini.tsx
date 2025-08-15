import React from 'react';
import { Product } from '@/types/products';
import { formatPrice } from '@/utils/currencyUtils';
import styles from './Products.module.css';
import { Monitor, Keyboard, Laptop, Phone, Tablet } from 'lucide-react';

interface ProductItemMiniProps {
  product: Product;
}

const ProductItemMini: React.FC<ProductItemMiniProps> = ({ product }) => {
  const price = formatPrice(product.price);

  const getTypeIcon = () => {
    switch (product.type) {
      case 'Monitors': return <Monitor size={20} />;
      case 'Keyboards': return <Keyboard size={20} />;
      case 'Laptops': return <Laptop size={20} />;
      case 'Phones': return <Phone size={20} />;
      case 'Tablets': return <Tablet size={20} />;
      default: return <span>📦</span>;
    }
  };

  return (
    <div className={`${styles.productItemMini}`}>
      <div className={`${styles.productCard__statusCircle} ${product.isNew === 1 ? styles.statusCircle__new : styles.statusCircle__used}`}></div>
      <div className={styles.productItemMini__iconContainer}>
        {getTypeIcon()}
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div className={styles.productCard__title} style={{ marginBottom: '0.25rem' }}>
          {product.title}
        </div>
        <div className={styles.productCard__serialNumber}>
          SN-{product.serialNumber}
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>
        {price.default}
      </div>
    </div>
  );
};

export default ProductItemMini;
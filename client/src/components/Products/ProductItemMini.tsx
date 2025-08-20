import React from 'react';
import { Product } from '@/types/products';
import ProductTypeIcon from './ProductTypeIcon';

interface ProductItemMiniProps {
  product: Product;
}

const ProductItemMini: React.FC<ProductItemMiniProps> = ({ product }) => {
  return (
    <div className="d-flex align-items-center min-w-0 overflow-hidden" style={{ gap: '2rem', maxWidth: '100%' }}>
      <div 
        className={`rounded-circle ${product.isNew === 1 ? 'bg-warning' : 'bg-dark'}`}
        style={{ width: '10px', height: '10px', flexShrink: 0 }}
      />
      
      <ProductTypeIcon type={product.type} />
      
      <div className="flex-1 text-start min-w-0 overflow-hidden">
        <div className="fw-semibold text-nowrap text-truncate">
          {product.title}
        </div>
        <div className="text-muted small text-truncate">
          SN-{product.serialNumber}
        </div>
      </div>
    </div>
  );
};

export default ProductItemMini;
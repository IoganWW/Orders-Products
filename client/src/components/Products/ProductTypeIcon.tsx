// client/src/components/Products/ProductTypeIcon.tsx
import React from 'react';
import { ProductType } from '@/types/products';
import { PRODUCT_TYPE_ICONS } from '@/types/products';
import { Monitor } from 'lucide-react'; // Используем Monitor в качестве дефолтной иконки

interface ProductTypeIconProps {
  type: ProductType;
  size?: number;
  color?: string;
  className?: string;
}

const ProductTypeIcon: React.FC<ProductTypeIconProps> = ({ type, size = 20, color, className }) => {
  const IconComponent = PRODUCT_TYPE_ICONS[type] || Monitor; // Выбираем иконку по типу или используем дефолтную

  return <IconComponent size={size} color={color} className={className} />;
};

export default ProductTypeIcon;
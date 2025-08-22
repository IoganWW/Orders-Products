// client/src/components/Products/ProductTypeIcon.tsx
import React from 'react';
import { ProductType } from '@/types/products';
import { PRODUCT_TYPE_ICONS } from '@/types/products';
import { Monitor } from 'lucide-react';

interface ProductTypeIconProps {
  type: ProductType;
  size?: number;
  color?: string;
  className?: string;
}

const ProductTypeIcon: React.FC<ProductTypeIconProps> = ({ type, size = 25, color, className }) => {
  // Приводим тип к нижнему регистру для поиска иконки
  const normalizedType = type.toLowerCase() as ProductType;
  const IconComponent = PRODUCT_TYPE_ICONS[normalizedType] || Monitor;
  return <IconComponent size={size} color={color} className={className} />;
};

export default ProductTypeIcon;
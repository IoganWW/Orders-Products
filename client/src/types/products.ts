import { Monitor, Keyboard, Laptop, Phone, Tablet } from 'lucide-react';
import { LucideIcon } from 'lucide-react'; //

export interface Product {
  id: number;
  serialNumber: number;
  isNew: 0 | 1;
  photo: string;
  title: string;
  type: ProductType;
  specification: string;
  guarantee: Guarantee;
  price: Price[];
  order: number;
  date: string;
}

export type ProductType = 'monitors' | 'laptops' | 'keyboards' | 'phones' | 'tablets';

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  monitors: 'products:monitors',
  laptops: 'products:laptops',
  keyboards: 'products:keyboards',
  phones: 'products:phones',
  tablets: 'products:tablets',
};

export interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  selectedType: ProductType | 'all';
  specificationFilter: string;
  loading: boolean;
  error: string | null;
}

// Новые интерфейсы для групп
export interface ProductGroup {
  type: ProductType;
  count: number;
  description: string;
}

export interface GroupsPageState {
  groups: ProductGroup[];
  totalGroups: number;
  totalProducts: number;
}

// Константы для описаний и иконок
export const PRODUCT_TYPE_DESCRIPTIONS: Record<ProductType, string> = {
  monitors: 'LCD и LED мониторы различных размеров',
  laptops: 'Ноутбуки и портативные компьютеры',
  keyboards: 'Клавиатуры механические и мембранные',
  phones: 'Мобильные телефоны и смартфоны',
  tablets: 'Планшеты и электронные книги',
};

export const PRODUCT_TYPE_ICONS: Record<ProductType, LucideIcon> = {
  monitors: Monitor,
  laptops: Laptop,
  keyboards: Keyboard,
  phones: Phone,
  tablets: Tablet,
};

// Утилиты для работы с группами
export const createProductGroups = (products: Product[]): ProductGroup[] => {
  const groupedProducts = products.reduce((acc, product) => {
    const type = product.type;
    if (!acc[type]) {
      acc[type] = {
        type,
        count: 0,
        description: PRODUCT_TYPE_DESCRIPTIONS[type],
      };
    }
    acc[type].count++;
    return acc;
  }, {} as Record<ProductType, ProductGroup>);

  return Object.values(groupedProducts);
};
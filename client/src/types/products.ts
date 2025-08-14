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

export type ProductType = 'Monitors' | 'Laptops' | 'Keyboards' | 'Phones' | 'Tablets';

export interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  selectedType: ProductType | 'All';
  specificationFilter: string;
  loading: boolean;
  error: string | null;
}

// Новые интерфейсы для групп
export interface ProductGroup {
  type: ProductType;
  count: number;
  description: string;
  icon: string;
}

export interface GroupsPageState {
  groups: ProductGroup[];
  totalGroups: number;
  totalProducts: number;
}

// Константы для описаний и иконок
export const PRODUCT_TYPE_DESCRIPTIONS: Record<ProductType, string> = {
  'Monitors': 'LCD и LED мониторы различных размеров',
  'Laptops': 'Ноутбуки и портативные компьютеры',
  'Keyboards': 'Клавиатуры механические и мембранные',
  'Phones': 'Мобильные телефоны и смартфоны',
  'Tablets': 'Планшеты и электронные книги'
};

export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  'Monitors': 'fas fa-desktop',
  'Laptops': 'fas fa-laptop',
  'Keyboards': 'fas fa-keyboard',
  'Phones': 'fas fa-mobile-alt',
  'Tablets': 'fas fa-tablet-alt'
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
        icon: PRODUCT_TYPE_ICONS[type]
      };
    }
    acc[type].count++;
    return acc;
  }, {} as Record<ProductType, ProductGroup>);

  return Object.values(groupedProducts);
};
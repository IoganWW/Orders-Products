export interface Product {
  id: number;
  serialNumber: number;
  isNew: 0 | 1;
  photo: string;
  title: string;
  type: string;
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
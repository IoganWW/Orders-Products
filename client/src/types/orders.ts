// client/src/types/orders.ts
import { Product } from "./products";

export interface Order {
  id: number;
  title: string;
  date: string;
  description: string;
  products: Product[];
}

export interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
}
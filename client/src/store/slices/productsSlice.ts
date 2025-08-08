import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductsState, Product, ProductType } from '@/types/products';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await axios.get(`${API_URL}/api/products`);
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId: number) => {
    await axios.delete(`${API_URL}/api/products/${productId}`);
    return productId;
  }
);

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  selectedType: 'All',
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductFilter: (state, action: PayloadAction<ProductType | 'All'>) => {
      state.selectedType = action.payload;
      
      if (action.payload === 'All') {
        state.filteredProducts = state.products;
      } else {
        state.filteredProducts = state.products.filter(
          product => product.type === action.payload
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        // Применяем текущий фильтр
        if (state.selectedType === 'All') {
          state.filteredProducts = action.payload;
        } else {
          state.filteredProducts = action.payload.filter(
            product => product.type === state.selectedType
          );
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Удаляем продукт из всех массивов
        state.products = state.products.filter(product => product.id !== action.payload);
        state.filteredProducts = state.filteredProducts.filter(product => product.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete product';
      });
  },
});

export const { setProductFilter, clearError } = productsSlice.actions;
export default productsSlice.reducer;
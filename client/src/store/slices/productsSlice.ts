// client/src/store/slices/productsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductsState, ProductType } from '@/types/products';
import api from '@/services/api'; // Используем api вместо axios

const normalizeProductType = (type: string): ProductType => {
  // Приводим к нижнему регистру для соответствия типам i18n
  return type.toLowerCase() as ProductType;
};

// Async thunks - обновляем для использования api interceptor
export const fetchProducts = createAsyncThunk(
 'products/fetchProducts',
 async (_, { rejectWithValue }) => {
   try {
     const response = await api.get('/api/products');
     // Нормализуем данные сразу при получении
     const normalizedProducts = response.data.map((product: any) => ({
       ...product,
       type: normalizeProductType(product.type)
     }));
     return normalizedProducts;
   } catch (error: any) {
     return rejectWithValue(error.message || 'Failed to fetch products');
   }
 }
);

export const deleteProduct = createAsyncThunk(
 'products/deleteProduct',
 async (productId: number, { rejectWithValue }) => {
   try {
     await api.delete(`/api/products/${productId}`);
     return productId; // Просто возвращаем ID - interceptor обработал success
   } catch (error: any) {
     return rejectWithValue(error.message || 'Failed to delete product');
   }
 }
);

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  selectedType: 'all',
  specificationFilter: 'all',
  loading: false,
  error: null,
};

// Функция для применения фильтров
const applyFilters = (state: ProductsState) => {
  state.filteredProducts = state.products.filter(product => {
    const typeMatch = state.selectedType === 'all' || product.type === state.selectedType;
    const specMatch = state.specificationFilter === 'all' || 
                     product.specification?.includes(state.specificationFilter);
    return typeMatch && specMatch;
  });
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductFilter: (state, action: PayloadAction<ProductType | 'all'>) => {
      state.selectedType = action.payload;
      applyFilters(state); // Применяем все фильтры
    },
    setSpecificationFilter: (state, action: PayloadAction<string>) => {
      state.specificationFilter = action.payload;
      applyFilters(state); // Применяем все фильтры
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
        // Применяем текущие фильтры
        applyFilters(state);
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to fetch products';
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
        state.error = action.payload as string || action.error.message || 'Failed to delete product';
      });
  },
});

export const { setProductFilter, setSpecificationFilter, clearError } = productsSlice.actions;
export default productsSlice.reducer;
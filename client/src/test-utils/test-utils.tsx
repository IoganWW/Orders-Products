// client/src/test-utils/test-utils.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, PreloadedState, createSlice } from '@reduxjs/toolkit'

// Импортируем реальные типы
import type { OrdersState, Order } from '@/types/orders'
import type { ProductsState, ProductType } from '@/types/products'
import type { AppState } from '@/types/app'
import type { AuthState, User } from '@/types/auth'

// Типы для тестового store
type MockRootState = {
  orders: OrdersState
  products: ProductsState
  app: AppState
  auth: AuthState
}

// Mock orders slice с реальными типами
const mockOrdersInitialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null
}

const mockOrdersSlice = createSlice({
  name: 'orders',
  initialState: mockOrdersInitialState,
  reducers: {
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

// Mock products slice с реальными типами
const mockProductsInitialState: ProductsState = {
  products: [],
  filteredProducts: [],
  selectedType: 'all',
  specificationFilter: 'all',
  loading: false,
  error: null
}

const mockProductsSlice = createSlice({
  name: 'products',
  initialState: mockProductsInitialState,
  reducers: {
    setProductFilter: (state, action) => {
      state.selectedType = action.payload
      // Применяем фильтр
      state.filteredProducts = state.products.filter(product => {
        const typeMatch = state.selectedType === 'all' || product.type === state.selectedType
        const specMatch = state.specificationFilter === 'all' || 
                         product.specification?.includes(state.specificationFilter)
        return typeMatch && specMatch
      })
    },
    setSpecificationFilter: (state, action) => {
      state.specificationFilter = action.payload
      // Применяем фильтр
      state.filteredProducts = state.products.filter(product => {
        const typeMatch = state.selectedType === 'all' || product.type === state.selectedType
        const specMatch = state.specificationFilter === 'all' || 
                         product.specification?.includes(state.specificationFilter)
        return typeMatch && specMatch
      })
    },
    clearError: (state) => {
      state.error = null
    },
    // Добавляем action для установки продуктов в тестах
    setProducts: (state, action) => {
      state.products = action.payload
      // Применяем текущие фильтры
      state.filteredProducts = state.products.filter(product => {
        const typeMatch = state.selectedType === 'all' || product.type === state.selectedType
        const specMatch = state.specificationFilter === 'all' || 
                         product.specification?.includes(state.specificationFilter)
        return typeMatch && specMatch
      })
    }
  }
})

// Mock app slice с реальными типами
const mockAppInitialState: AppState = {
  activeSessions: 0,
  currentTime: new Date(),
  isConnected: false,
  theme: 'light',
  locale: 'uk'
}

const mockAppSlice = createSlice({
  name: 'app',
  initialState: mockAppInitialState,
  reducers: {
    setActiveSessions: (state, action) => {
      state.activeSessions = action.payload
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setLocale: (state, action) => {
      state.locale = action.payload
    }
  }
})

// Mock auth slice с реальными типами
const mockAuthInitialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // В реальном authSlice loading по умолчанию true
  error: null
}

const mockAuthSlice = createSlice({
  name: 'auth',
  initialState: mockAuthInitialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setAuthFromStorage: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
    }
  }
})

// Экспорт действий для тестов
export const { setSelectedOrder, clearError } = mockOrdersSlice.actions
export const { setProductFilter, setSpecificationFilter, clearError: clearProductsError, setProducts } = mockProductsSlice.actions
export const { setActiveSessions, setCurrentTime, setConnectionStatus, toggleTheme, setLocale } = mockAppSlice.actions
export const { clearError: clearAuthError, setAuthFromStorage } = mockAuthSlice.actions

// Настройка store для тестов
export function setupStore(preloadedState?: PreloadedState<MockRootState>) {
  return configureStore({
    reducer: {
      orders: mockOrdersSlice.reducer,
      products: mockProductsSlice.reducer,
      app: mockAppSlice.reducer,
      auth: mockAuthSlice.reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['app/setCurrentTime'],
          ignoredPaths: ['app.currentTime'],
        },
      }),
  })
}

// Создаем тип для тестового store
export type TestStore = ReturnType<typeof setupStore>

// Типизированная функция рендера
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState<MockRootState>
  store?: TestStore
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Экспорт всего из testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Mock данные для тестов с правильными типами
export const mockOrder: Order = {
  id: 1,
  title: 'Test Order',
  date: '2024-01-01 10:00:00',
  description: 'Test order description',
  products: [
    {
      id: 1,
      serialNumber: 1234,
      isNew: 1 as const,
      photo: 'test.jpg',
      title: 'Test Product',
      type: 'monitors' as const,
      specification: 'Test spec',
      guarantee: {
        start: '2024-01-01 10:00:00',
        end: '2025-01-01 10:00:00'
      },
      price: [
        { value: 100, symbol: 'USD', isDefault: 0 as const },
        { value: 2600, symbol: 'UAH', isDefault: 1 as const }
      ],
      order: 1,
      date: '2024-01-01 10:00:00'
    }
  ]
}

export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
}

// Экспорт типов для использования в тестах
export type { MockRootState, Order, User, ProductType }
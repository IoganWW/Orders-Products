// client/src/test-utils/test-utils.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

// Импортируем slices правильно
import ordersReducer from '@/store/slices/ordersSlice'
import productsReducer from '@/store/slices/productsSlice'
import appReducer from '@/store/slices/appSlice'
import authReducer from '@/store/slices/authSlice'

// Настройка store для тестов
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>
  store?: ReturnType<typeof setupStore>
}

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      orders: ordersReducer,
      products: productsReducer,
      app: appReducer,
      auth: authReducer,
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

// Mock данные для тестов
export const mockOrder = {
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
      type: 'Monitors' as const,
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

export const mockProduct = {
  id: 1,
  serialNumber: 1234,
  isNew: 1 as const,
  photo: 'test.jpg',
  title: 'Test Product',
  type: 'Monitors' as const,
  specification: 'Test specification',
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

export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  created_at: '2024-01-01 10:00:00',
  updated_at: '2024-01-01 10:00:00'
}
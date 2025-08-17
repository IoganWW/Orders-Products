// client/src/test-utils/setupTests.ts
import '@testing-library/jest-dom'

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'uk',
    },
  }),
}))

// Mock i18n lib - ВАЖНО: этот мок должен быть до импорта dateUtils
jest.mock('@/lib/i18n', () => {
  const mockI18n = {
    t: jest.fn((key: string) => {
      // Возвращаем фиктивные переводы для месяцев и дней
      const translations: { [key: string]: string } = {
        'common:jan': 'Січ',
        'common:feb': 'Лют', 
        'common:mar': 'Бер',
        'common:apr': 'Кві',
        'common:may': 'Тра',
        'common:jun': 'Чер',
        'common:jul': 'Лип',
        'common:aug': 'Сер',
        'common:sep': 'Вер',
        'common:oct': 'Жов',
        'common:nov': 'Лис',
        'common:dec': 'Гру',
        'common:monday': 'Понеділок',
        'common:tuesday': 'Вівторок',
        'common:wednesday': 'Середа',
        'common:thursday': 'Четвер',
        'common:friday': "П'ятниця",
        'common:saturday': 'Субота',
        'common:sunday': 'Неділя'
      }
      return translations[key] || key
    }),
    language: 'uk'
  }
  
  return {
    default: mockI18n,
    __esModule: true
  }
})

// Mock store
jest.mock('@/store', () => ({
  store: {
    getState: jest.fn(() => ({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      },
      orders: {
        orders: [],
        selectedOrder: null,
        loading: false,
        error: null
      },
      products: {
        products: [],
        filteredProducts: [],
        selectedType: 'all',
        specificationFilter: 'all',
        loading: false,
        error: null
      },
      app: {
        activeSessions: 0,
        currentTime: new Date(),
        isConnected: false,
        theme: 'light',
        locale: 'uk'
      }
    })),
    dispatch: jest.fn(),
    subscribe: jest.fn()
  },
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn()
}))

// Mock API services
jest.mock('@/services/api', () => {
  const mockApi = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  return {
    __esModule: true,
    default: mockApi,
    fetchUsers: jest.fn(),
    fetchOrders: jest.fn(),
    fetchProducts: jest.fn()
  };
});

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  })),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const createStorageMock = () => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', { value: createStorageMock() });
Object.defineProperty(window, 'sessionStorage', { value: createStorageMock() });

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})
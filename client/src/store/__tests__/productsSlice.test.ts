// client/src/store/__tests__/productsSlice.test.ts
import { 
  setupStore, 
  type TestStore, 
  type MockRootState,
  setProductFilter, 
  setSpecificationFilter, 
  clearProductsError,
  setProducts
} from '@/test-utils/test-utils'

const mockProducts = [
  {
    id: 1,
    serialNumber: 1234,
    isNew: 1 as const,
    photo: 'test.jpg',
    title: 'Test Monitor',
    type: 'monitors' as const,
    specification: 'Full HD monitor',
    guarantee: {
      start: '2024-01-01 10:00:00',
      end: '2025-01-01 10:00:00'
    },
    price: [
      { value: 300, symbol: 'USD', isDefault: 1 as const }
    ],
    order: 1,
    date: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    serialNumber: 5678,
    isNew: 0 as const,
    photo: 'laptop.jpg',
    title: 'Test Laptop',
    type: 'laptops' as const,
    specification: 'Gaming laptop',
    guarantee: {
      start: '2024-01-01 10:00:00',
      end: '2025-01-01 10:00:00'
    },
    price: [
      { value: 1500, symbol: 'USD', isDefault: 1 as const }
    ],
    order: 1,
    date: '2024-01-01 10:00:00'
  }
]

describe('productsSlice', () => {
  let store: TestStore

  beforeEach(() => {
    store = setupStore()
  })

  it('should have correct initial state', () => {
    const state = store.getState()
    expect(state.products).toEqual({
      products: [],
      filteredProducts: [],
      selectedType: 'all',
      specificationFilter: 'all',
      loading: false,
      error: null
    })
  })

  it('should filter products correctly', () => {
    // Сначала устанавливаем продукты
    store.dispatch(setProducts(mockProducts))
    
    // Затем применяем фильтр
    store.dispatch(setProductFilter('monitors'))

    const state = store.getState()
    expect(state.products.filteredProducts).toHaveLength(1)
    expect(state.products.filteredProducts[0].type).toBe('monitors')
    expect(state.products.selectedType).toBe('monitors')
  })

  it('should filter by specification', () => {
    store.dispatch(setProducts(mockProducts))
    store.dispatch(setSpecificationFilter('Gaming'))

    const state = store.getState()
    expect(state.products.filteredProducts).toHaveLength(1)
    expect(state.products.filteredProducts[0].specification).toContain('Gaming')
    expect(state.products.specificationFilter).toBe('Gaming')
  })

  it('should show all products when filter is "all"', () => {
    store.dispatch(setProducts(mockProducts))
    store.dispatch(setProductFilter('all'))

    const state = store.getState()
    expect(state.products.filteredProducts).toHaveLength(2)
    expect(state.products.selectedType).toBe('all')
  })

  it('should combine type and specification filters', () => {
    store.dispatch(setProducts(mockProducts))
    store.dispatch(setProductFilter('laptops'))
    store.dispatch(setSpecificationFilter('Gaming'))

    const state = store.getState()
    expect(state.products.filteredProducts).toHaveLength(1)
    expect(state.products.filteredProducts[0].type).toBe('laptops')
    expect(state.products.filteredProducts[0].specification).toContain('Gaming')
  })

  it('should return empty array when no products match filters', () => {
    store.dispatch(setProducts(mockProducts))
    store.dispatch(setProductFilter('monitors'))
    store.dispatch(setSpecificationFilter('Gaming'))

    const state = store.getState()
    expect(state.products.filteredProducts).toHaveLength(0)
  })

  it('should clear error', () => {
    const preloadedState: Partial<MockRootState> = {
      products: {
        products: [],
        filteredProducts: [],
        selectedType: 'all',
        specificationFilter: 'all',
        loading: false,
        error: 'Test error'
      }
    }

    const storeWithError = setupStore(preloadedState)
    storeWithError.dispatch(clearProductsError())
    
    const state = storeWithError.getState()
    expect(state.products.error).toBeNull()
  })
})
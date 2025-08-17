
// client/src/store/__tests__/productsSlice.test.ts
import { setupStore, type TestStore, mockProduct } from '@/test-utils/test-utils'
import { 
  setProductFilter, 
  setSpecificationFilter, 
  clearError 
} from '../slices/productsSlice'

describe('productsSlice', () => {
  let store: TestStore

  beforeEach(() => {
    store = setupStore()
  })

  it('should handle setProductFilter', () => {
    store.dispatch(setProductFilter('monitors'))
    
    const state = store.getState()
    expect(state.products.selectedType).toBe('monitors')
  })

  it('should handle setProductFilter with "all"', () => {
    store.dispatch(setProductFilter('all'))
    
    const state = store.getState()
    expect(state.products.selectedType).toBe('all')
  })

  it('should handle setSpecificationFilter', () => {
    store.dispatch(setSpecificationFilter('Gaming'))
    
    const state = store.getState()
    expect(state.products.specificationFilter).toBe('Gaming')
  })

  it('should handle clearError', () => {
    // Создаем store с ошибкой в preloadedState
    const storeWithError = setupStore({
      products: {
        products: [],
        filteredProducts: [],
        selectedType: 'all',
        specificationFilter: 'all',
        loading: false,
        error: 'Test error'
      }
    })

    storeWithError.dispatch(clearError())
    
    const state = storeWithError.getState()
    expect(state.products.error).toBeNull()
  })

  it('should filter products correctly', () => {
    // Создаем store с тестовыми продуктами
    const storeWithProducts = setupStore({
      products: {
        products: [mockProduct, { ...mockProduct, id: 2, type: 'laptops' }],
        filteredProducts: [],
        selectedType: 'all',
        specificationFilter: 'all',
        loading: false,
        error: null
      }
    })

    // Фильтруем по типу
    storeWithProducts.dispatch(setProductFilter('monitors'))
    
    const state = storeWithProducts.getState()
    expect(state.products.filteredProducts).toHaveLength(1)
    expect(state.products.filteredProducts[0].type).toBe('monitors')
  })
})
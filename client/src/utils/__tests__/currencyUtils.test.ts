// client/src/utils/__tests__/currencyUtils.test.ts
import { formatPrice, calculateOrderTotal } from '../currencyUtils'
import { mockProduct } from '@/test-utils/test-utils'

describe('currencyUtils', () => {
  describe('formatPrice', () => {
    it('formats price correctly', () => {
      const prices = [
        { value: 100, symbol: 'USD', isDefault: 0 },
        { value: 2600, symbol: 'UAH', isDefault: 1 }
      ]
      
      const result = formatPrice(prices)
      
      expect(result.default).toBe('2600 UAH')
      expect(result.all).toBe('100 USD / 2600 UAH')
      expect(result.primary?.symbol).toBe('UAH')
      expect(result.secondary).toHaveLength(1)
    })

    it('handles empty prices array', () => {
      const result = formatPrice([])
      
      expect(result.default).toBe('—')
      expect(result.all).toBe('')
      expect(result.primary).toBeUndefined()
    })
  })

  describe('calculateOrderTotal', () => {
    it('calculates order total correctly', () => {
      const products = [mockProduct]
      const result = calculateOrderTotal(products)
      
      expect(result).toHaveLength(2) // USD and UAH
      expect(result[0].symbol).toMatch(/USD|UAH/)
      expect(result[0].value).toBeGreaterThan(0)
    })

    it('handles empty products array', () => {
      const result = calculateOrderTotal([])
      expect(result).toHaveLength(0)
    })
  })
})

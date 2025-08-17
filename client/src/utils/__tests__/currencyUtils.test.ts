// client/src/utils/__tests__/currencyUtils.test.ts
import { formatPrice, calculateOrderTotal } from '../currencyUtils'
import type { Price } from '@/types/common'

describe('currencyUtils', () => {
  describe('formatPrice', () => {
    it('should format prices with default price', () => {
      const prices: Price[] = [
        { value: 100, symbol: 'USD', isDefault: 0 },
        { value: 2600, symbol: 'UAH', isDefault: 1 },
        { value: 90, symbol: 'EUR', isDefault: 0 }
      ]

      const result = formatPrice(prices)

      expect(result.default).toBe('2600 UAH')
      expect(result.all).toBe('100 USD / 2600 UAH / 90 EUR')
      expect(result.primary).toEqual({ value: 2600, symbol: 'UAH', isDefault: 1 })
      expect(result.secondary).toHaveLength(2)
      expect(result.secondary).toEqual([
        { value: 100, symbol: 'USD', isDefault: 0 },
        { value: 90, symbol: 'EUR', isDefault: 0 }
      ])
    })

    it('should handle no default price', () => {
      const prices: Price[] = [
        { value: 100, symbol: 'USD', isDefault: 0 },
        { value: 90, symbol: 'EUR', isDefault: 0 }
      ]

      const result = formatPrice(prices)

      expect(result.default).toBe('—')
      expect(result.all).toBe('100 USD / 90 EUR')
      expect(result.primary).toBeUndefined()
      expect(result.secondary).toHaveLength(2)
    })

    it('should handle empty prices array', () => {
      const prices: Price[] = []

      const result = formatPrice(prices)

      expect(result.default).toBe('—')
      expect(result.all).toBe('')
      expect(result.primary).toBeUndefined()
      expect(result.secondary).toHaveLength(0)
    })

    it('should handle single price as default', () => {
      const prices: Price[] = [
        { value: 500, symbol: 'USD', isDefault: 1 }
      ]

      const result = formatPrice(prices)

      expect(result.default).toBe('500 USD')
      expect(result.all).toBe('500 USD')
      expect(result.primary).toEqual({ value: 500, symbol: 'USD', isDefault: 1 })
      expect(result.secondary).toHaveLength(0)
    })
  })

  describe('calculateOrderTotal', () => {
    it('should calculate total for products with same currency', () => {
      const products = [
        {
          price: [
            { value: 100, symbol: 'USD', isDefault: 1 },
            { value: 2600, symbol: 'UAH', isDefault: 0 }
          ]
        },
        {
          price: [
            { value: 200, symbol: 'USD', isDefault: 1 },
            { value: 5200, symbol: 'UAH', isDefault: 0 }
          ]
        }
      ]

      const result = calculateOrderTotal(products)

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        { value: 300, symbol: 'USD', formatted: '300.00 USD' },
        { value: 7800, symbol: 'UAH', formatted: '7800.00 UAH' }
      ])
    })

    it('should handle products with different currencies', () => {
      const products = [
        {
          price: [
            { value: 100, symbol: 'USD', isDefault: 1 }
          ]
        },
        {
          price: [
            { value: 90, symbol: 'EUR', isDefault: 1 }
          ]
        }
      ]

      const result = calculateOrderTotal(products)

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        { value: 100, symbol: 'USD', formatted: '100.00 USD' },
        { value: 90, symbol: 'EUR', formatted: '90.00 EUR' }
      ])
    })

    it('should handle empty products array', () => {
      const products: any[] = []

      const result = calculateOrderTotal(products)

      expect(result).toEqual([])
    })

    it('should handle products without prices', () => {
      const products = [
        { price: [] },
        { price: [] }
      ]

      const result = calculateOrderTotal(products)

      expect(result).toEqual([])
    })

    it('should handle decimal values correctly', () => {
      const products = [
        {
          price: [
            { value: 99.99, symbol: 'USD', isDefault: 1 }
          ]
        },
        {
          price: [
            { value: 0.01, symbol: 'USD', isDefault: 1 }
          ]
        }
      ]

      const result = calculateOrderTotal(products)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        value: 100,
        symbol: 'USD',
        formatted: '100.00 USD'
      })
    })
  })
})

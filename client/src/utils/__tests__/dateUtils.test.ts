// client/src/utils/__tests__/dateUtils.test.ts
import { formatDate, isDateExpired, getDaysBetween, safeDateFormat } from '../dateUtils'

// Mock i18n
jest.mock('@/lib/i18n', () => ({
  language: 'en',
  t: (key: string) => key,
}))

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const testDate = '2024-01-15 10:30:00'
      const result = formatDate(testDate, 'en')
      
      expect(result.short).toMatch(/\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}/)
      expect(result.long).toContain('January')
      expect(result.full).toContain('10:30:00')
    })

    it('handles invalid date gracefully', () => {
      const result = formatDate('invalid-date', 'en')
      
      expect(result.short).toBe('N/A')
      expect(result.long).toBe('Invalid Date')
    })

    it('handles empty string', () => {
      const result = formatDate('', 'en')
      
      expect(result.short).toBe('N/A')
      expect(result.long).toBe('Invalid Date')
    })
  })

  describe('isDateExpired', () => {
    it('returns true for past dates', () => {
      const pastDate = '2020-01-01 00:00:00'
      expect(isDateExpired(pastDate)).toBe(true)
    })

    it('returns false for future dates', () => {
      const futureDate = '2030-01-01 00:00:00'
      expect(isDateExpired(futureDate)).toBe(false)
    })

    it('handles invalid dates', () => {
      expect(isDateExpired('invalid')).toBe(false)
      expect(isDateExpired('')).toBe(false)
    })
  })

  describe('getDaysBetween', () => {
    it('calculates days between dates correctly', () => {
      const start = '2024-01-01 00:00:00'
      const end = '2024-01-11 00:00:00'
      
      expect(getDaysBetween(start, end)).toBe(10)
    })

    it('handles invalid dates', () => {
      expect(getDaysBetween('invalid', '2024-01-01')).toBe(0)
      expect(getDaysBetween('', '')).toBe(0)
    })
  })

  describe('safeDateFormat', () => {
    it('returns formatted date for valid input', () => {
      const result = safeDateFormat('2024-01-15 10:30:00')
      expect(result).not.toBe('Не указано')
    })

    it('returns fallback for invalid input', () => {
      expect(safeDateFormat(null)).toBe('Не указано')
      expect(safeDateFormat('', 'Custom fallback')).toBe('Custom fallback')
    })
  })
})


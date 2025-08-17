// client/src/utils/__tests__/validation.test.ts
import { 
  validateEmail, 
  validateRequired, 
  validateMinLength, 
  getValidationMessage 
} from '../validation'

describe('validation utils', () => {
  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('rejects incorrect email', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('validates non-empty strings', () => {
      expect(validateRequired('hello')).toBe(true)
      expect(validateRequired(' test ')).toBe(true)
    })

    it('rejects empty strings', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
    })
  })

  describe('validateMinLength', () => {
    it('validates strings with minimum length', () => {
      expect(validateMinLength('hello', 3)).toBe(true)
      expect(validateMinLength('test', 4)).toBe(true)
    })

    it('rejects strings shorter than minimum', () => {
      expect(validateMinLength('hi', 3)).toBe(false)
      expect(validateMinLength('', 1)).toBe(false)
    })
  })

  describe('getValidationMessage', () => {
    it('returns correct validation messages', () => {
      expect(getValidationMessage('Email', 'required')).toBe('Email is required')
      expect(getValidationMessage('Password', 'minLength', 8)).toBe('Password must be at least 8 characters')
      expect(getValidationMessage('Field', 'unknown')).toBe('Field is invalid')
    })
  })
})
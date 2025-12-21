/**
 * Test cases for error handling utilities
 */

import {
  validateEmail,
  validatePhone,
  validateOTP,
  validateFutureDate,
  validateFileUpload,
  AppError,
  ValidationError,
  AuthenticationError,
  handleApiError,
} from '@/lib/utils/errorHandler'

describe('Error Handling Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('test @example.com')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate Indian phone numbers', () => {
      expect(validatePhone('9876543210')).toBe(true)
      expect(validatePhone('+919876543210')).toBe(true)
      expect(validatePhone('09876543210')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('1234567890')).toBe(false) // Doesn't start with 6-9
      expect(validatePhone('987654321')).toBe(false) // Too short
      expect(validatePhone('abc1234567')).toBe(false) // Contains letters
    })
  })

  describe('validateOTP', () => {
    it('should validate 6-digit OTP', () => {
      expect(validateOTP('123456')).toBe(true)
      expect(validateOTP('000000')).toBe(true)
    })

    it('should reject invalid OTP', () => {
      expect(validateOTP('12345')).toBe(false) // Too short
      expect(validateOTP('1234567')).toBe(false) // Too long
      expect(validateOTP('abcdef')).toBe(false) // Contains letters
    })
  })

  describe('validateFutureDate', () => {
    it('should validate future dates', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(validateFutureDate(tomorrow.toISOString().split('T')[0])).toBe(true)
    })

    it('should reject past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(validateFutureDate(yesterday.toISOString().split('T')[0])).toBe(false)
    })

    it('should accept today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(validateFutureDate(today)).toBe(true)
    })
  })

  describe('validateFileUpload', () => {
    it('should validate file size', () => {
      const file = new File(['x'.repeat(11 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFileUpload(file, { maxSize: 10 })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File size')
    })

    it('should validate file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = validateFileUpload(file, {
        allowedTypes: ['image/jpeg', 'image/png'],
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File type')
    })

    it('should accept valid files', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = validateFileUpload(file)
      expect(result.valid).toBe(true)
    })
  })

  describe('Error Classes', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_ERROR')
      expect(error.statusCode).toBe(400)
    })

    it('should create ValidationError', () => {
      const error = new ValidationError('Invalid input', 'email')
      expect(error.message).toBe('Invalid input')
      expect(error.field).toBe('email')
      expect(error.statusCode).toBe(400)
    })

    it('should create AuthenticationError', () => {
      const error = new AuthenticationError()
      expect(error.statusCode).toBe(401)
    })
  })

  describe('handleApiError', () => {
    it('should handle AppError instances', () => {
      const error = new AppError('Custom error', 'CUSTOM', 400)
      expect(handleApiError(error)).toBe('Custom error')
    })

    it('should handle API response errors', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      }
      expect(handleApiError(error)).toBe('Bad request')
    })

    it('should handle network errors', () => {
      const error = { request: {} }
      expect(handleApiError(error)).toContain('Unable to connect')
    })

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error')
      expect(handleApiError(error)).toContain('unexpected error')
    })
  })
})


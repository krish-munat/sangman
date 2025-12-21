/**
 * Centralized Error Handling Utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'PAYMENT_ERROR', 402, details)
    this.name = 'PaymentError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0)
    this.name = 'NetworkError'
  }
}

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: any): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error.response) {
    // API responded with error
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 400:
        return data?.message || 'Invalid request. Please check your input.'
      case 401:
        return 'Please login to continue.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 422:
        return data?.message || 'Validation failed. Please check your input.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return data?.message || 'An error occurred. Please try again.'
    }
  }

  if (error.request) {
    // Request made but no response
    return 'Unable to connect to server. Please check your internet connection.'
  }

  // Unknown error
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

/**
 * Validate OTP format
 */
export function validateOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

/**
 * Validate date is not in the past
 */
export function validateFutureDate(date: string): boolean {
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate >= today
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in MB
    allowedTypes?: string[]
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] } = options

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSize}MB`,
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Safe async function wrapper with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn()
    return { data }
  } catch (error) {
    return {
      error: errorMessage || handleApiError(error),
    }
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * React hook for error handling with toast notifications
 */
export function useErrorHandler() {
  return {
    handleError: (error: any, defaultMessage?: string) => {
      const message = defaultMessage || handleApiError(error)
      // Toast will be shown by the component using this hook
      return message
    },
  }
}

/**
 * Handle error and return error message
 * Components should call toast.error() with the returned message
 */
export function handleError(error: any, defaultMessage?: string): string {
  return defaultMessage || handleApiError(error)
}


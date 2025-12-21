/**
 * API Client with Error Handling
 */

import {
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  handleApiError,
} from '../utils/errorHandler'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeout = 30000, retries = 0, ...fetchOptions } = options

    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Get auth token from store
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('sangman-auth') 
          ? JSON.parse(localStorage.getItem('sangman-auth') || '{}')?.state?.token 
          : null
        : null

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw new AppError(
            `Request failed with status ${response.status}`,
            'HTTP_ERROR',
            response.status
          )
        }
        return {} as T
      }

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error status codes
        switch (response.status) {
          case 401:
            throw new AuthenticationError(data.message || 'Authentication failed')
          case 403:
            throw new AuthorizationError(data.message || 'Access denied')
          case 404:
            throw new NotFoundError(data.resource || 'Resource')
          case 422:
            throw new AppError(
              data.message || 'Validation failed',
              'VALIDATION_ERROR',
              422,
              data.errors
            )
          default:
            throw new AppError(
              data.message || 'Request failed',
              'API_ERROR',
              response.status,
              data
            )
        }
      }

      return data
    } catch (error: any) {
      clearTimeout(timeoutId)

      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout. Please try again.')
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new NetworkError('Unable to connect to server. Please check your internet connection.')
      }

      // Retry logic
      if (retries > 0 && !(error instanceof AuthenticationError)) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return this.request<T>(endpoint, { ...options, retries: retries - 1 })
      }

      // Re-throw known errors
      if (error instanceof AppError) {
        throw error
      }

      // Wrap unknown errors
      throw new AppError(
        error.message || 'An unexpected error occurred',
        'UNKNOWN_ERROR',
        500
      )
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()

// Convenience functions
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => apiClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient.post<T>(endpoint, data, options),
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient.put<T>(endpoint, data, options),
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient.patch<T>(endpoint, data, options),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient.delete<T>(endpoint, options),
}


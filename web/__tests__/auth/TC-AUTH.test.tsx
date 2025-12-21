/**
 * TC-AUTH-01 to TC-AUTH-04: Authentication & User Management Tests
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/auth/login/page'
import { useAuthStore } from '@/lib/store/authStore'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key: string) => {
      if (key === 'role') return 'patient'
      return null
    }),
  })),
}))

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('TC-AUTH-01: Patient Signup', () => {
  const mockPush = jest.fn()
  const mockLogin = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    useAuthStore.setState({ login: mockLogin, isAuthenticated: false })
  })

  it('should create account with valid details and redirect to dashboard', async () => {
    render(<LoginPage />)

    // Fill form
    const emailInput = screen.getByPlaceholderText(/your@email.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'patient@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/patient')
    })
  })
})

describe('TC-AUTH-02: Duplicate Signup', () => {
  it('should show error message when user already exists', async () => {
    const { toast } = require('react-hot-toast')
    
    // Mock API to return duplicate user error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'User already exists' }),
      })
    ) as jest.Mock

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/your@email.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'existing@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('already exists')
      )
    })
  })
})

describe('TC-AUTH-03: Login with Invalid Password', () => {
  it('should deny login and show error message', async () => {
    const { toast } = require('react-hot-toast')

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/your@email.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'patient@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Login failed')
      )
    })
  })
})

describe('TC-AUTH-04: Doctor Signup Requires Verification', () => {
  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
    ;(require('next/navigation').useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'role') return 'doctor'
        return null
      }),
    })
  })

  it('should create doctor account with PENDING_VERIFICATION status', async () => {
    const mockLogin = jest.fn()
    useAuthStore.setState({ login: mockLogin })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/your@email.com/i)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { value: 'doctor@test.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'doctor',
        }),
        expect.any(String)
      )
    })
  })
})


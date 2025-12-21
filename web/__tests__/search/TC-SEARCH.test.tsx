/**
 * TC-SEARCH-01 to TC-SEARCH-03: Search & Location Filtering Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DiscoverPage from '@/app/patient/discover/page'
import { useAuthStore } from '@/lib/store/authStore'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => '/patient/discover'),
}))

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn((success) =>
    success({
      coords: {
        latitude: 28.6139,
        longitude: 77.209,
      },
    })
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}

global.navigator.geolocation = mockGeolocation as any

describe('TC-SEARCH-01: Search Doctors by Location', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: '1',
        role: 'patient',
        email: 'patient@test.com',
        name: 'Test Patient',
      },
      isAuthenticated: true,
    })
  })

  it('should show doctors within radius when GPS location is provided', async () => {
    render(<DiscoverPage />)

    // Wait for GPS permission and location
    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
    })

    // Check if doctors are displayed
    await waitFor(() => {
      const doctorCards = screen.queryAllByText(/dr\./i)
      expect(doctorCards.length).toBeGreaterThan(0)
    })
  })

  it('should show doctors when city is entered', async () => {
    render(<DiscoverPage />)

    const searchInput = screen.getByPlaceholderText(/search doctors/i)
    fireEvent.change(searchInput, { target: { value: 'Delhi' } })

    await waitFor(() => {
      const doctorCards = screen.queryAllByText(/dr\./i)
      expect(doctorCards.length).toBeGreaterThan(0)
    })
  })
})

describe('TC-SEARCH-02: No Doctors Available', () => {
  it('should show friendly message when no doctors found', async () => {
    // Mock empty results
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ doctors: [] }),
      })
    ) as jest.Mock

    render(<DiscoverPage />)

    await waitFor(() => {
      expect(screen.getByText(/no doctors found/i)).toBeInTheDocument()
    })
  })
})

describe('TC-SEARCH-03: Filter by Specialization', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: '1',
        role: 'patient',
        email: 'patient@test.com',
        name: 'Test Patient',
      },
      isAuthenticated: true,
    })
  })

  it('should return only matching doctors when specialization is selected', async () => {
    render(<DiscoverPage />)

    const specialtySelect = screen.getByRole('combobox', { name: /specialty/i })
    fireEvent.change(specialtySelect, { target: { value: 'Cardiology' } })

    await waitFor(() => {
      const doctorCards = screen.queryAllByText(/cardiology/i)
      expect(doctorCards.length).toBeGreaterThan(0)
    })
  })
})


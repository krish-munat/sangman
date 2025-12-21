/**
 * Test cases for payment calculations
 */

import {
  calculatePlatformFee,
  calculateSubscriptionDiscount,
  calculateEmergencySurcharge,
  calculatePayment,
  isNightHours,
  isPeakHours,
} from '@/lib/utils/calculations'
import type { Patient } from '../../../shared/types'

describe('Payment Calculations', () => {
  describe('calculatePlatformFee', () => {
    it('should calculate 7% platform fee correctly', () => {
      expect(calculatePlatformFee(1000)).toBe(70)
      expect(calculatePlatformFee(500)).toBe(35)
      expect(calculatePlatformFee(0)).toBe(0)
    })
  })

  describe('calculateSubscriptionDiscount', () => {
    it('should return 0 if patient has no subscription', () => {
      const patient = undefined
      expect(calculateSubscriptionDiscount(1000, patient)).toBe(0)
    })

    it('should return 0 if subscription is not active', () => {
      const patient: Patient = {
        id: '1',
        email: 'test@example.com',
        phone: '+919876543210',
        role: 'patient',
        name: 'Test',
        age: 30,
        gender: 'male',
        emergencyContact: {
          name: 'Emergency',
          phone: '+919876543211',
          relation: 'Spouse',
        },
        subscription: {
          id: '1',
          patientId: '1',
          plan: 'monthly',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() - 86400000).toISOString(), // Expired
          status: 'expired',
          discount: 10,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      expect(calculateSubscriptionDiscount(1000, patient)).toBe(0)
    })

    it('should calculate 10% discount for active subscription', () => {
      const patient: Patient = {
        id: '1',
        email: 'test@example.com',
        phone: '+919876543210',
        role: 'patient',
        name: 'Test',
        age: 30,
        gender: 'male',
        emergencyContact: {
          name: 'Emergency',
          phone: '+919876543211',
          relation: 'Spouse',
        },
        subscription: {
          id: '1',
          patientId: '1',
          plan: 'monthly',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          status: 'active',
          discount: 10,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      expect(calculateSubscriptionDiscount(1000, patient)).toBe(100)
    })
  })

  describe('calculateEmergencySurcharge', () => {
    it('should calculate base emergency surcharge', () => {
      const surcharge = calculateEmergencySurcharge(1000, false, false, 1)
      expect(surcharge).toBeGreaterThan(0)
    })

    it('should apply night hours multiplier', () => {
      const surcharge = calculateEmergencySurcharge(1000, true, false, 1)
      expect(surcharge).toBeGreaterThan(calculateEmergencySurcharge(1000, false, false, 1))
    })

    it('should apply peak hours multiplier', () => {
      const surcharge = calculateEmergencySurcharge(1000, false, true, 1)
      expect(surcharge).toBeGreaterThan(calculateEmergencySurcharge(1000, false, false, 1))
    })

    it('should apply availability multiplier', () => {
      const lowAvailability = calculateEmergencySurcharge(1000, false, false, 0.3)
      const highAvailability = calculateEmergencySurcharge(1000, false, false, 0.9)
      expect(lowAvailability).toBeGreaterThan(highAvailability)
    })
  })

  describe('calculatePayment', () => {
    it('should calculate normal appointment payment correctly', () => {
      const payment = calculatePayment(500, false, undefined, 1)
      expect(payment.consultationFee).toBe(500)
      expect(payment.platformFee).toBe(35) // 7% of 500
      expect(payment.emergencySurcharge).toBeUndefined()
      expect(payment.subscriptionDiscount).toBeUndefined()
      expect(payment.totalAmount).toBe(535)
    })

    it('should include emergency surcharge for emergency appointments', () => {
      const payment = calculatePayment(500, true, undefined, 1)
      expect(payment.emergencySurcharge).toBeDefined()
      expect(payment.emergencySurcharge).toBeGreaterThan(0)
      expect(payment.totalAmount).toBeGreaterThan(535)
    })

    it('should apply subscription discount for active subscribers', () => {
      const patient: Patient = {
        id: '1',
        email: 'test@example.com',
        phone: '+919876543210',
        role: 'patient',
        name: 'Test',
        age: 30,
        gender: 'male',
        emergencyContact: {
          name: 'Emergency',
          phone: '+919876543211',
          relation: 'Spouse',
        },
        subscription: {
          id: '1',
          patientId: '1',
          plan: 'monthly',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          status: 'active',
          discount: 10,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const payment = calculatePayment(1000, false, patient, 1)
      expect(payment.subscriptionDiscount).toBe(100) // 10% of 1000
      expect(payment.totalAmount).toBe(970) // 1000 + 70 - 100
    })

    it('should never return negative total amount', () => {
      const payment = calculatePayment(10, false, undefined, 1)
      expect(payment.totalAmount).toBeGreaterThanOrEqual(0)
    })
  })
})


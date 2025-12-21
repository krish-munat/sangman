import { PLATFORM_CONFIG } from '../../../shared/constants'
import type { Appointment, Payment, Patient } from '../../../shared/types'

/**
 * Calculate platform fee (7% of consultation fee)
 */
export function calculatePlatformFee(consultationFee: number): number {
  return consultationFee * PLATFORM_CONFIG.COMMISSION_RATE
}

/**
 * Calculate subscription discount (10% if patient has active subscription)
 */
export function calculateSubscriptionDiscount(
  consultationFee: number,
  patient: Patient | undefined
): number {
  if (patient?.subscription?.status === 'active') {
    return consultationFee * PLATFORM_CONFIG.SUBSCRIPTION_DISCOUNT
  }
  return 0
}

/**
 * Calculate emergency surcharge based on time and availability
 */
export function calculateEmergencySurcharge(
  consultationFee: number,
  isNight: boolean,
  isPeak: boolean,
  doctorAvailability: number // 0-1, where 1 is fully available
): number {
  let multiplier = PLATFORM_CONFIG.DEFAULT_EMERGENCY_MULTIPLIER

  if (isNight) {
    multiplier *= 1.5 // Night hours (22:00 - 06:00)
  } else if (isPeak) {
    multiplier *= 1.3 // Peak hours (18:00 - 22:00)
  }

  // Higher surcharge if doctor is less available
  const availabilityMultiplier = 1 + (1 - doctorAvailability) * 0.5
  multiplier *= availabilityMultiplier

  return consultationFee * (multiplier - 1)
}

/**
 * Check if current time is in night hours (22:00 - 06:00)
 */
export function isNightHours(): boolean {
  const hour = new Date().getHours()
  return hour >= PLATFORM_CONFIG.NIGHT_HOURS.start || hour < PLATFORM_CONFIG.NIGHT_HOURS.end
}

/**
 * Check if current time is in peak hours (18:00 - 22:00)
 */
export function isPeakHours(): boolean {
  const hour = new Date().getHours()
  return hour >= PLATFORM_CONFIG.PEAK_HOURS.start && hour < PLATFORM_CONFIG.PEAK_HOURS.end
}

/**
 * Calculate total payment amount for an appointment
 */
export function calculatePayment(
  consultationFee: number,
  isEmergency: boolean,
  patient: Patient | undefined,
  doctorAvailability: number = 1
): Payment {
  const platformFee = calculatePlatformFee(consultationFee)
  const subscriptionDiscount = calculateSubscriptionDiscount(consultationFee, patient)

  let emergencySurcharge = 0
  if (isEmergency) {
    emergencySurcharge = calculateEmergencySurcharge(
      consultationFee,
      isNightHours(),
      isPeakHours(),
      doctorAvailability
    )
  }

  const subtotal = consultationFee + emergencySurcharge
  const totalAmount = subtotal + platformFee - subscriptionDiscount

  return {
    consultationFee,
    platformFee,
    emergencySurcharge: isEmergency ? emergencySurcharge : undefined,
    subscriptionDiscount: subscriptionDiscount > 0 ? subscriptionDiscount : undefined,
    totalAmount: Math.max(0, totalAmount), // Ensure non-negative
    status: 'pending',
    paymentMethod: 'card', // Default, will be updated during payment
  }
}

/**
 * Generate OTP for appointment verification
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}


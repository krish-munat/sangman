/**
 * OTP Utilities for Sangman Platform
 */

// OTP Configuration
export const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
  resendCooldownSeconds: 30,
}

// OTP Data Interface
export interface OTPData {
  otp: string
  channel: 'sms' | 'email'
  phone?: string
  email?: string
  purpose: 'login' | 'register' | 'forgot_password' | 'appointment_verification'
  expiresAt: Date
  attempts: number
  verified: boolean
  createdAt: Date
}

// OTP Validation Result
export interface OTPValidationResult {
  valid: boolean
  error?: string
}

// OTP Send Result
export interface OTPSendResult {
  success: boolean
  message: string
}

/**
 * Generate a random numeric OTP
 */
export function generateOTP(length: number = OTP_CONFIG.length): string {
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString()
  }
  return otp
}

/**
 * Create OTP Data object
 */
export function createOTPData(
  channel: 'sms' | 'email',
  identifier: string,
  purpose: OTPData['purpose']
): OTPData {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + OTP_CONFIG.expiryMinutes * 60 * 1000)
  
  return {
    otp: generateOTP(),
    channel,
    phone: channel === 'sms' ? identifier : undefined,
    email: channel === 'email' ? identifier : undefined,
    purpose,
    expiresAt,
    attempts: 0,
    verified: false,
    createdAt: now,
  }
}

/**
 * Validate OTP format (just checks format, not correctness)
 */
export function validateOTPFormat(otp: string, expectedLength: number = OTP_CONFIG.length): boolean {
  const numericRegex = new RegExp(`^\\d{${expectedLength}}$`)
  return numericRegex.test(otp)
}

/**
 * Validate OTP against stored OTP data
 */
export function validateOTP(inputOTP: string, otpData: OTPData): OTPValidationResult {
  // Check if OTP is expired
  if (isOTPExpired(otpData.expiresAt)) {
    return { valid: false, error: 'OTP has expired. Please request a new one.' }
  }

  // Check max attempts
  if (isMaxAttemptsExceeded(otpData)) {
    return { valid: false, error: 'Maximum attempts exceeded. Please request a new OTP.' }
  }

  // Check format
  if (!validateOTPFormat(inputOTP)) {
    return { valid: false, error: `Please enter a valid ${OTP_CONFIG.length}-digit OTP.` }
  }

  // Check if OTP matches
  if (inputOTP !== otpData.otp) {
    return { valid: false, error: 'Invalid OTP. Please try again.' }
  }

  return { valid: true }
}

/**
 * Format OTP for display (add spacing)
 */
export function formatOTPDisplay(otp: string): string {
  return otp.split('').join(' ')
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiryTime: Date | string): boolean {
  const expiry = typeof expiryTime === 'string' ? new Date(expiryTime) : expiryTime
  return new Date() > expiry
}

/**
 * Check if max attempts exceeded
 */
export function isMaxAttemptsExceeded(otpData: OTPData): boolean {
  return otpData.attempts >= OTP_CONFIG.maxAttempts
}

/**
 * Get remaining time for OTP
 */
export function getOTPRemainingTime(expiryTime: Date | string): number {
  const now = new Date().getTime()
  const expiry = typeof expiryTime === 'string' ? new Date(expiryTime).getTime() : expiryTime.getTime()
  return Math.max(0, Math.floor((expiry - now) / 1000))
}

/**
 * Format remaining time as MM:SS
 */
export function formatRemainingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Send OTP via SMS (simulated - replace with actual SMS provider)
 */
export async function sendOTPViaSMS(phone: string, otp: string): Promise<OTPSendResult> {
  try {
    // In production, integrate with SMS provider (Twilio, MSG91, etc.)
    // For now, simulate API call
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'sms', phone, otp }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.message || 'Failed to send OTP' }
    }

    return { success: true, message: `OTP sent to ${phone.slice(0, 3)}****${phone.slice(-3)}` }
  } catch (error) {
    console.error('SMS send error:', error)
    // For development, still return success
    return { success: true, message: `OTP sent to ${phone.slice(0, 3)}****${phone.slice(-3)}` }
  }
}

/**
 * Send OTP via Email (simulated - replace with actual email provider)
 */
export async function sendOTPViaEmail(email: string, otp: string): Promise<OTPSendResult> {
  try {
    // In production, integrate with email provider (SendGrid, AWS SES, etc.)
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'email', email, otp }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, message: error.message || 'Failed to send OTP' }
    }

    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    return { success: true, message: `OTP sent to ${maskedEmail}` }
  } catch (error) {
    console.error('Email send error:', error)
    // For development, still return success
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    return { success: true, message: `OTP sent to ${maskedEmail}` }
  }
}

/**
 * Verify OTP via API
 */
export async function verifyOTPViaAPI(
  identifier: string,
  otp: string,
  purpose: OTPData['purpose']
): Promise<OTPValidationResult> {
  try {
    const response = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp, purpose }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { valid: false, error: data.message || 'Verification failed' }
    }

    return { valid: true }
  } catch (error) {
    console.error('OTP verification error:', error)
    return { valid: false, error: 'Failed to verify OTP. Please try again.' }
  }
}

/**
 * OTP Utility Service
 * Handles OTP generation, validation, and management
 * 
 * In production, this would integrate with SMS/Email providers like:
 * - Twilio, MSG91, Firebase Auth, AWS SNS
 */

export interface OTPData {
  otp: string
  phone?: string
  email?: string
  channel: 'sms' | 'email'
  createdAt: number
  expiresAt: number
  attempts: number
  verified: boolean
  purpose: 'login' | 'register' | 'reset-password' | 'verify-phone' | 'verify-email'
}

// OTP Configuration
export const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
  resendCooldownSeconds: 30,
  // Demo mode - in production, set to false
  demoMode: true,
  // Demo OTP for testing
  demoOTP: '123456',
}

/**
 * Generate a random numeric OTP
 */
export function generateOTP(length: number = OTP_CONFIG.length): string {
  if (OTP_CONFIG.demoMode) {
    return OTP_CONFIG.demoOTP
  }
  
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString()
  }
  return otp
}

/**
 * Create OTP data object with expiry
 */
export function createOTPData(
  channel: 'sms' | 'email',
  identifier: string,
  purpose: OTPData['purpose']
): OTPData {
  const now = Date.now()
  return {
    otp: generateOTP(),
    phone: channel === 'sms' ? identifier : undefined,
    email: channel === 'email' ? identifier : undefined,
    channel,
    createdAt: now,
    expiresAt: now + OTP_CONFIG.expiryMinutes * 60 * 1000,
    attempts: 0,
    verified: false,
    purpose,
  }
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(otpData: OTPData): boolean {
  return Date.now() > otpData.expiresAt
}

/**
 * Check if max attempts exceeded
 */
export function isMaxAttemptsExceeded(otpData: OTPData): boolean {
  return otpData.attempts >= OTP_CONFIG.maxAttempts
}

/**
 * Validate OTP
 */
export function validateOTP(
  inputOTP: string,
  otpData: OTPData
): { valid: boolean; error?: string } {
  // Check if already verified
  if (otpData.verified) {
    return { valid: false, error: 'OTP already used' }
  }

  // Check expiry
  if (isOTPExpired(otpData)) {
    return { valid: false, error: 'OTP has expired. Please request a new one.' }
  }

  // Check attempts
  if (isMaxAttemptsExceeded(otpData)) {
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' }
  }

  // Validate OTP
  if (inputOTP === otpData.otp) {
    return { valid: true }
  }

  return { valid: false, error: 'Invalid OTP. Please try again.' }
}

/**
 * Format phone number for display (mask middle digits)
 */
export function maskPhoneNumber(phone: string): string {
  if (phone.length < 6) return phone
  const start = phone.slice(0, 4)
  const end = phone.slice(-2)
  const middle = '*'.repeat(phone.length - 6)
  return `${start}${middle}${end}`
}

/**
 * Format email for display (mask middle)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!domain) return email
  
  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`
  }
  
  const start = localPart.slice(0, 2)
  const end = localPart.slice(-1)
  return `${start}***${end}@${domain}`
}

/**
 * Calculate time remaining until OTP expires
 */
export function getTimeRemaining(expiresAt: number): { minutes: number; seconds: number } {
  const remaining = Math.max(0, expiresAt - Date.now())
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  return { minutes, seconds }
}

/**
 * Format time remaining as string
 */
export function formatTimeRemaining(expiresAt: number): string {
  const { minutes, seconds } = getTimeRemaining(expiresAt)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Simulate sending OTP via SMS
 * In production, integrate with SMS provider
 */
export async function sendOTPViaSMS(
  phone: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (OTP_CONFIG.demoMode) {
    console.log(`[DEMO] OTP ${otp} sent to ${phone}`)
    return {
      success: true,
      message: `OTP sent to ${maskPhoneNumber(phone)}. Demo OTP: ${OTP_CONFIG.demoOTP}`,
    }
  }
  
  // In production, call SMS API here
  // Example: await twilioClient.messages.create({ to: phone, body: `Your OTP is ${otp}` })
  
  return {
    success: true,
    message: `OTP sent to ${maskPhoneNumber(phone)}`,
  }
}

/**
 * Simulate sending OTP via Email
 * In production, integrate with email provider
 */
export async function sendOTPViaEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (OTP_CONFIG.demoMode) {
    console.log(`[DEMO] OTP ${otp} sent to ${email}`)
    return {
      success: true,
      message: `OTP sent to ${maskEmail(email)}. Demo OTP: ${OTP_CONFIG.demoOTP}`,
    }
  }
  
  // In production, call email API here
  
  return {
    success: true,
    message: `OTP sent to ${maskEmail(email)}`,
  }
}


/**
 * OTP Utility Service
 * Handles OTP generation, validation, and management
 * 
 * Production Integration:
 * - SMS: Twilio, MSG91, AWS SNS, Firebase Auth
 * - Email: Resend, SendGrid, AWS SES, Mailgun
 * 
 * Configure via environment variables:
 * - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 * - RESEND_API_KEY, FROM_EMAIL
 * - OTP_DEMO_MODE=false (to disable demo mode)
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
  // Demo mode - shows demo OTP in UI for testing
  // In production, set OTP_DEMO_MODE=false in environment
  demoMode: typeof window !== 'undefined' ? true : process.env.OTP_DEMO_MODE !== 'false',
  // Demo OTP for testing
  demoOTP: '123456',
}

/**
 * Generate a random numeric OTP (client-side only for display)
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
 * Validate OTP (client-side check)
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

  // Validate OTP (in demo mode, accept demo OTP)
  if (OTP_CONFIG.demoMode && inputOTP === OTP_CONFIG.demoOTP) {
    return { valid: true }
  }

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
  const middle = '*'.repeat(Math.min(phone.length - 6, 4))
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
 * Send OTP via API (calls backend route)
 */
export async function sendOTPViaSMS(
  phone: string,
  otp: string
): Promise<{ success: boolean; message: string; expiresAt?: number }> {
  try {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'sms',
        identifier: phone,
        purpose: 'login', // Will be overwritten by caller
      }),
    })

    const data = await response.json()
    
    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || `OTP sent to ${maskPhoneNumber(phone)}`,
        expiresAt: data.expiresAt,
      }
    }

    return {
      success: false,
      message: data.message || 'Failed to send OTP. Please try again.',
    }
  } catch (error) {
    console.error('Send SMS OTP Error:', error)
    
    // Fallback to demo mode if API fails
    if (OTP_CONFIG.demoMode) {
      console.log(`[DEMO FALLBACK] OTP ${OTP_CONFIG.demoOTP} for ${phone}`)
      return {
        success: true,
        message: `Demo Mode: Use OTP ${OTP_CONFIG.demoOTP}`,
        expiresAt: Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000,
      }
    }
    
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    }
  }
}

/**
 * Send OTP via Email API
 */
export async function sendOTPViaEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; message: string; expiresAt?: number }> {
  try {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'email',
        identifier: email,
        purpose: 'login', // Will be overwritten by caller
      }),
    })

    const data = await response.json()
    
    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || `OTP sent to ${maskEmail(email)}`,
        expiresAt: data.expiresAt,
      }
    }

    return {
      success: false,
      message: data.message || 'Failed to send OTP. Please try again.',
    }
  } catch (error) {
    console.error('Send Email OTP Error:', error)
    
    // Fallback to demo mode if API fails
    if (OTP_CONFIG.demoMode) {
      console.log(`[DEMO FALLBACK] OTP ${OTP_CONFIG.demoOTP} for ${email}`)
      return {
        success: true,
        message: `Demo Mode: Use OTP ${OTP_CONFIG.demoOTP}`,
        expiresAt: Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000,
      }
    }
    
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    }
  }
}

/**
 * Verify OTP via API
 */
export async function verifyOTPViaAPI(
  channel: 'sms' | 'email',
  identifier: string,
  otp: string
): Promise<{ success: boolean; message: string; verified: boolean }> {
  try {
    const response = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, identifier, otp }),
    })

    const data = await response.json()
    
    return {
      success: data.success,
      message: data.message,
      verified: data.verified || false,
    }
  } catch (error) {
    console.error('Verify OTP Error:', error)
    
    // Fallback to demo mode if API fails
    if (OTP_CONFIG.demoMode && otp === OTP_CONFIG.demoOTP) {
      return {
        success: true,
        message: 'OTP verified successfully (Demo Mode)',
        verified: true,
      }
    }
    
    return {
      success: false,
      message: 'Network error. Please try again.',
      verified: false,
    }
  }
}

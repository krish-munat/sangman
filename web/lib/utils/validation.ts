// Validation utilities for SANGMAN Platform

// Country codes with phone number length validation
export const COUNTRY_CODES = [
  { code: '+91', country: 'India', minLength: 10, maxLength: 10, flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', minLength: 10, maxLength: 10, flag: '🇺🇸' },
  { code: '+44', country: 'UK', minLength: 10, maxLength: 10, flag: '🇬🇧' },
  { code: '+971', country: 'UAE', minLength: 9, maxLength: 9, flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', minLength: 9, maxLength: 9, flag: '🇸🇦' },
  { code: '+65', country: 'Singapore', minLength: 8, maxLength: 8, flag: '🇸🇬' },
  { code: '+61', country: 'Australia', minLength: 9, maxLength: 9, flag: '🇦🇺' },
  { code: '+49', country: 'Germany', minLength: 10, maxLength: 11, flag: '🇩🇪' },
  { code: '+33', country: 'France', minLength: 9, maxLength: 9, flag: '🇫🇷' },
  { code: '+81', country: 'Japan', minLength: 10, maxLength: 10, flag: '🇯🇵' },
  { code: '+86', country: 'China', minLength: 11, maxLength: 11, flag: '🇨🇳' },
  { code: '+977', country: 'Nepal', minLength: 10, maxLength: 10, flag: '🇳🇵' },
  { code: '+880', country: 'Bangladesh', minLength: 10, maxLength: 10, flag: '🇧🇩' },
  { code: '+92', country: 'Pakistan', minLength: 10, maxLength: 10, flag: '🇵🇰' },
  { code: '+94', country: 'Sri Lanka', minLength: 9, maxLength: 9, flag: '🇱🇰' },
] as const

export type CountryCode = typeof COUNTRY_CODES[number]

/**
 * Get country details by country code
 */
export function getCountryByCode(code: string): CountryCode | undefined {
  return COUNTRY_CODES.find(c => c.code === code)
}

/**
 * Validate phone number length based on country code
 */
export function validatePhoneByCountry(phone: string, countryCode: string): { valid: boolean; error?: string } {
  const country = getCountryByCode(countryCode)
  
  if (!country) {
    return { valid: false, error: 'Invalid country code' }
  }

  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  if (digitsOnly.length < country.minLength) {
    return { 
      valid: false, 
      error: `Phone number must be at least ${country.minLength} digits for ${country.country}` 
    }
  }
  
  if (digitsOnly.length > country.maxLength) {
    return { 
      valid: false, 
      error: `Phone number must be at most ${country.maxLength} digits for ${country.country}` 
    }
  }

  // Basic pattern check - should only contain digits
  if (!/^\d+$/.test(digitsOnly)) {
    return { valid: false, error: 'Phone number should only contain digits' }
  }

  return { valid: true }
}

/**
 * Password strength requirements
 */
export interface PasswordStrength {
  isValid: boolean
  score: number // 0-5
  errors: string[]
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const errors: string[] = []
  
  if (!requirements.minLength) {
    errors.push('Password must be at least 8 characters')
  }
  if (!requirements.hasUppercase) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!requirements.hasLowercase) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!requirements.hasNumber) {
    errors.push('Password must contain at least one number')
  }
  if (!requirements.hasSpecialChar) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }

  const score = Object.values(requirements).filter(Boolean).length
  const isValid = score === 5

  return { isValid, score, errors, requirements }
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): { label: string; color: string } {
  switch (score) {
    case 0:
    case 1:
      return { label: 'Very Weak', color: 'red' }
    case 2:
      return { label: 'Weak', color: 'orange' }
    case 3:
      return { label: 'Fair', color: 'yellow' }
    case 4:
      return { label: 'Good', color: 'lime' }
    case 5:
      return { label: 'Strong', color: 'green' }
    default:
      return { label: 'Very Weak', color: 'red' }
  }
}

/**
 * Validate that emergency phone is different from user phone
 */
export function validateDifferentPhones(userPhone: string, emergencyPhone: string): { valid: boolean; error?: string } {
  // Normalize phone numbers for comparison
  const normalizedUser = userPhone.replace(/\D/g, '')
  const normalizedEmergency = emergencyPhone.replace(/\D/g, '')

  if (normalizedUser === normalizedEmergency) {
    return { 
      valid: false, 
      error: 'Emergency contact phone must be different from your phone number' 
    }
  }

  return { valid: true }
}

/**
 * Format phone number with country code
 */
export function formatPhoneWithCountryCode(phone: string, countryCode: string): string {
  const digitsOnly = phone.replace(/\D/g, '')
  return `${countryCode}${digitsOnly}`
}


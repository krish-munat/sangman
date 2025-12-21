// Validation utilities for SANGMAN Platform
// Designed for worldwide deployment with comprehensive country support

// ================================
// Country Codes Database
// Comprehensive list for global deployment
// ================================

export const COUNTRY_CODES = [
  // South Asia (Primary Markets)
  { code: '+91', country: 'India', minLength: 10, maxLength: 10, flag: '🇮🇳', region: 'Asia' },
  { code: '+92', country: 'Pakistan', minLength: 10, maxLength: 10, flag: '🇵🇰', region: 'Asia' },
  { code: '+880', country: 'Bangladesh', minLength: 10, maxLength: 10, flag: '🇧🇩', region: 'Asia' },
  { code: '+977', country: 'Nepal', minLength: 10, maxLength: 10, flag: '🇳🇵', region: 'Asia' },
  { code: '+94', country: 'Sri Lanka', minLength: 9, maxLength: 9, flag: '🇱🇰', region: 'Asia' },
  { code: '+960', country: 'Maldives', minLength: 7, maxLength: 7, flag: '🇲🇻', region: 'Asia' },
  { code: '+975', country: 'Bhutan', minLength: 8, maxLength: 8, flag: '🇧🇹', region: 'Asia' },
  { code: '+93', country: 'Afghanistan', minLength: 9, maxLength: 9, flag: '🇦🇫', region: 'Asia' },
  
  // Middle East (High Demand Markets)
  { code: '+971', country: 'UAE', minLength: 9, maxLength: 9, flag: '🇦🇪', region: 'Middle East' },
  { code: '+966', country: 'Saudi Arabia', minLength: 9, maxLength: 9, flag: '🇸🇦', region: 'Middle East' },
  { code: '+974', country: 'Qatar', minLength: 8, maxLength: 8, flag: '🇶🇦', region: 'Middle East' },
  { code: '+968', country: 'Oman', minLength: 8, maxLength: 8, flag: '🇴🇲', region: 'Middle East' },
  { code: '+973', country: 'Bahrain', minLength: 8, maxLength: 8, flag: '🇧🇭', region: 'Middle East' },
  { code: '+965', country: 'Kuwait', minLength: 8, maxLength: 8, flag: '🇰🇼', region: 'Middle East' },
  { code: '+962', country: 'Jordan', minLength: 9, maxLength: 9, flag: '🇯🇴', region: 'Middle East' },
  { code: '+972', country: 'Israel', minLength: 9, maxLength: 9, flag: '🇮🇱', region: 'Middle East' },
  { code: '+961', country: 'Lebanon', minLength: 8, maxLength: 8, flag: '🇱🇧', region: 'Middle East' },
  { code: '+964', country: 'Iraq', minLength: 10, maxLength: 10, flag: '🇮🇶', region: 'Middle East' },
  { code: '+98', country: 'Iran', minLength: 10, maxLength: 10, flag: '🇮🇷', region: 'Middle East' },
  { code: '+90', country: 'Turkey', minLength: 10, maxLength: 10, flag: '🇹🇷', region: 'Middle East' },
  
  // North America
  { code: '+1', country: 'USA/Canada', minLength: 10, maxLength: 10, flag: '🇺🇸', region: 'North America' },
  { code: '+52', country: 'Mexico', minLength: 10, maxLength: 10, flag: '🇲🇽', region: 'North America' },
  
  // Europe
  { code: '+44', country: 'United Kingdom', minLength: 10, maxLength: 10, flag: '🇬🇧', region: 'Europe' },
  { code: '+49', country: 'Germany', minLength: 10, maxLength: 11, flag: '🇩🇪', region: 'Europe' },
  { code: '+33', country: 'France', minLength: 9, maxLength: 9, flag: '🇫🇷', region: 'Europe' },
  { code: '+39', country: 'Italy', minLength: 9, maxLength: 10, flag: '🇮🇹', region: 'Europe' },
  { code: '+34', country: 'Spain', minLength: 9, maxLength: 9, flag: '🇪🇸', region: 'Europe' },
  { code: '+31', country: 'Netherlands', minLength: 9, maxLength: 9, flag: '🇳🇱', region: 'Europe' },
  { code: '+32', country: 'Belgium', minLength: 9, maxLength: 9, flag: '🇧🇪', region: 'Europe' },
  { code: '+41', country: 'Switzerland', minLength: 9, maxLength: 9, flag: '🇨🇭', region: 'Europe' },
  { code: '+43', country: 'Austria', minLength: 10, maxLength: 11, flag: '🇦🇹', region: 'Europe' },
  { code: '+46', country: 'Sweden', minLength: 9, maxLength: 9, flag: '🇸🇪', region: 'Europe' },
  { code: '+47', country: 'Norway', minLength: 8, maxLength: 8, flag: '🇳🇴', region: 'Europe' },
  { code: '+45', country: 'Denmark', minLength: 8, maxLength: 8, flag: '🇩🇰', region: 'Europe' },
  { code: '+358', country: 'Finland', minLength: 9, maxLength: 10, flag: '🇫🇮', region: 'Europe' },
  { code: '+48', country: 'Poland', minLength: 9, maxLength: 9, flag: '🇵🇱', region: 'Europe' },
  { code: '+353', country: 'Ireland', minLength: 9, maxLength: 9, flag: '🇮🇪', region: 'Europe' },
  { code: '+351', country: 'Portugal', minLength: 9, maxLength: 9, flag: '🇵🇹', region: 'Europe' },
  { code: '+30', country: 'Greece', minLength: 10, maxLength: 10, flag: '🇬🇷', region: 'Europe' },
  { code: '+7', country: 'Russia', minLength: 10, maxLength: 10, flag: '🇷🇺', region: 'Europe' },
  { code: '+380', country: 'Ukraine', minLength: 9, maxLength: 9, flag: '🇺🇦', region: 'Europe' },
  
  // East Asia
  { code: '+81', country: 'Japan', minLength: 10, maxLength: 10, flag: '🇯🇵', region: 'Asia' },
  { code: '+86', country: 'China', minLength: 11, maxLength: 11, flag: '🇨🇳', region: 'Asia' },
  { code: '+82', country: 'South Korea', minLength: 9, maxLength: 10, flag: '🇰🇷', region: 'Asia' },
  { code: '+852', country: 'Hong Kong', minLength: 8, maxLength: 8, flag: '🇭🇰', region: 'Asia' },
  { code: '+853', country: 'Macau', minLength: 8, maxLength: 8, flag: '🇲🇴', region: 'Asia' },
  { code: '+886', country: 'Taiwan', minLength: 9, maxLength: 9, flag: '🇹🇼', region: 'Asia' },
  { code: '+976', country: 'Mongolia', minLength: 8, maxLength: 8, flag: '🇲🇳', region: 'Asia' },
  
  // Southeast Asia
  { code: '+65', country: 'Singapore', minLength: 8, maxLength: 8, flag: '🇸🇬', region: 'Asia' },
  { code: '+60', country: 'Malaysia', minLength: 9, maxLength: 10, flag: '🇲🇾', region: 'Asia' },
  { code: '+66', country: 'Thailand', minLength: 9, maxLength: 9, flag: '🇹🇭', region: 'Asia' },
  { code: '+62', country: 'Indonesia', minLength: 10, maxLength: 12, flag: '🇮🇩', region: 'Asia' },
  { code: '+63', country: 'Philippines', minLength: 10, maxLength: 10, flag: '🇵🇭', region: 'Asia' },
  { code: '+84', country: 'Vietnam', minLength: 9, maxLength: 10, flag: '🇻🇳', region: 'Asia' },
  { code: '+95', country: 'Myanmar', minLength: 9, maxLength: 9, flag: '🇲🇲', region: 'Asia' },
  { code: '+855', country: 'Cambodia', minLength: 8, maxLength: 9, flag: '🇰🇭', region: 'Asia' },
  { code: '+856', country: 'Laos', minLength: 8, maxLength: 9, flag: '🇱🇦', region: 'Asia' },
  { code: '+673', country: 'Brunei', minLength: 7, maxLength: 7, flag: '🇧🇳', region: 'Asia' },
  
  // Oceania
  { code: '+61', country: 'Australia', minLength: 9, maxLength: 9, flag: '🇦🇺', region: 'Oceania' },
  { code: '+64', country: 'New Zealand', minLength: 9, maxLength: 10, flag: '🇳🇿', region: 'Oceania' },
  { code: '+679', country: 'Fiji', minLength: 7, maxLength: 7, flag: '🇫🇯', region: 'Oceania' },
  
  // Africa
  { code: '+27', country: 'South Africa', minLength: 9, maxLength: 9, flag: '🇿🇦', region: 'Africa' },
  { code: '+20', country: 'Egypt', minLength: 10, maxLength: 10, flag: '🇪🇬', region: 'Africa' },
  { code: '+234', country: 'Nigeria', minLength: 10, maxLength: 10, flag: '🇳🇬', region: 'Africa' },
  { code: '+254', country: 'Kenya', minLength: 9, maxLength: 9, flag: '🇰🇪', region: 'Africa' },
  { code: '+255', country: 'Tanzania', minLength: 9, maxLength: 9, flag: '🇹🇿', region: 'Africa' },
  { code: '+256', country: 'Uganda', minLength: 9, maxLength: 9, flag: '🇺🇬', region: 'Africa' },
  { code: '+233', country: 'Ghana', minLength: 9, maxLength: 9, flag: '🇬🇭', region: 'Africa' },
  { code: '+212', country: 'Morocco', minLength: 9, maxLength: 9, flag: '🇲🇦', region: 'Africa' },
  { code: '+251', country: 'Ethiopia', minLength: 9, maxLength: 9, flag: '🇪🇹', region: 'Africa' },
  { code: '+263', country: 'Zimbabwe', minLength: 9, maxLength: 9, flag: '🇿🇼', region: 'Africa' },
  
  // South America
  { code: '+55', country: 'Brazil', minLength: 10, maxLength: 11, flag: '🇧🇷', region: 'South America' },
  { code: '+54', country: 'Argentina', minLength: 10, maxLength: 10, flag: '🇦🇷', region: 'South America' },
  { code: '+56', country: 'Chile', minLength: 9, maxLength: 9, flag: '🇨🇱', region: 'South America' },
  { code: '+57', country: 'Colombia', minLength: 10, maxLength: 10, flag: '🇨🇴', region: 'South America' },
  { code: '+51', country: 'Peru', minLength: 9, maxLength: 9, flag: '🇵🇪', region: 'South America' },
  { code: '+58', country: 'Venezuela', minLength: 10, maxLength: 10, flag: '🇻🇪', region: 'South America' },
  { code: '+593', country: 'Ecuador', minLength: 9, maxLength: 9, flag: '🇪🇨', region: 'South America' },
  
  // Caribbean
  { code: '+1876', country: 'Jamaica', minLength: 7, maxLength: 7, flag: '🇯🇲', region: 'Caribbean' },
  { code: '+1868', country: 'Trinidad & Tobago', minLength: 7, maxLength: 7, flag: '🇹🇹', region: 'Caribbean' },
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


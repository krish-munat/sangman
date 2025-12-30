// Country codes for phone validation
export const COUNTRY_CODES = [
  { code: '+91', country: 'India', minLength: 10, maxLength: 10 },
  { code: '+1', country: 'USA/Canada', minLength: 10, maxLength: 10 },
  { code: '+44', country: 'UK', minLength: 10, maxLength: 10 },
  { code: '+971', country: 'UAE', minLength: 9, maxLength: 9 },
  { code: '+61', country: 'Australia', minLength: 9, maxLength: 9 },
  { code: '+65', country: 'Singapore', minLength: 8, maxLength: 8 },
  { code: '+60', country: 'Malaysia', minLength: 9, maxLength: 10 },
  { code: '+966', country: 'Saudi Arabia', minLength: 9, maxLength: 9 },
]

interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate phone number based on country code
 */
export function validatePhoneByCountry(phone: string, countryCode: string): ValidationResult {
  // Remove any spaces or special characters
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (!cleanPhone) {
    return { valid: false, error: 'Phone number is required' }
  }

  // Find country config
  const countryConfig = COUNTRY_CODES.find(c => c.code === countryCode)
  
  if (!countryConfig) {
    // Default validation for unknown country codes
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return { valid: false, error: 'Phone number must be 8-15 digits' }
    }
    return { valid: true }
  }

  // Validate length based on country
  if (cleanPhone.length < countryConfig.minLength) {
    return { 
      valid: false, 
      error: `Phone number must be at least ${countryConfig.minLength} digits for ${countryConfig.country}` 
    }
  }

  if (cleanPhone.length > countryConfig.maxLength) {
    return { 
      valid: false, 
      error: `Phone number must not exceed ${countryConfig.maxLength} digits for ${countryConfig.country}` 
    }
  }

  // Additional validation for Indian numbers (should start with 6-9)
  if (countryCode === '+91' && !/^[6-9]/.test(cleanPhone)) {
    return { valid: false, error: 'Indian mobile numbers must start with 6, 7, 8, or 9' }
  }

  return { valid: true }
}

/**
 * Check if two phone numbers are different
 */
export function validateDifferentPhones(phone1: string, phone2: string): ValidationResult {
  // Normalize both phones (remove spaces, dashes, etc.)
  const normalizedPhone1 = phone1.replace(/\D/g, '')
  const normalizedPhone2 = phone2.replace(/\D/g, '')

  if (normalizedPhone1 === normalizedPhone2) {
    return { valid: false, error: 'Emergency contact phone must be different from your phone number' }
  }

  return { valid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  return { valid: true }
}

/**
 * Validate name
 */
export function validateName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Name is required' }
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' }
  }

  if (name.trim().length > 100) {
    return { valid: false, error: 'Name must not exceed 100 characters' }
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(name.trim())) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
  }

  return { valid: true }
}

/**
 * Format phone for display
 */
export function formatPhoneDisplay(countryCode: string, phone: string): string {
  if (!phone) return ''
  
  // Remove non-digits
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Format based on country
  if (countryCode === '+91' && cleanPhone.length === 10) {
    return `${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
  }
  
  if (countryCode === '+1' && cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`
  }
  
  return cleanPhone
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

export interface PasswordStrengthResult {
  score: number // 0-5
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecialChar: boolean
  }
  isValid: boolean
}

export interface PasswordStrengthLabel {
  label: string
  color: 'red' | 'orange' | 'yellow' | 'lime' | 'green'
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  // Calculate score based on requirements met
  let score = 0
  if (requirements.minLength) score++
  if (requirements.hasUppercase) score++
  if (requirements.hasLowercase) score++
  if (requirements.hasNumber) score++
  if (requirements.hasSpecialChar) score++

  // Password is valid if it meets minimum requirements
  const isValid = requirements.minLength && 
                  requirements.hasUppercase && 
                  requirements.hasLowercase && 
                  requirements.hasNumber

  return { score, requirements, isValid }
}

/**
 * Get password strength label and color
 */
export function getPasswordStrengthLabel(score: number): PasswordStrengthLabel {
  switch (score) {
    case 0:
    case 1:
      return { label: 'Very Weak', color: 'red' }
    case 2:
      return { label: 'Weak', color: 'orange' }
    case 3:
      return { label: 'Fair', color: 'yellow' }
    case 4:
      return { label: 'Strong', color: 'lime' }
    case 5:
      return { label: 'Very Strong', color: 'green' }
    default:
      return { label: 'Unknown', color: 'red' }
  }
}

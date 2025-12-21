// Security utilities for SANGMAN platform

// ================================
// Rate Limiting
// ================================

interface RateLimitEntry {
  count: number
  firstAttempt: number
  lastAttempt: number
  blocked: boolean
  blockedUntil: number
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map()

// Rate limit configuration
export const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 5,           // Max attempts before blocking
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes window
  BLOCK_DURATION_MS: 30 * 60 * 1000, // 30 minutes block
  OTP_MAX_REQUESTS: 3,       // Max OTP requests per window
  OTP_WINDOW_MS: 10 * 60 * 1000, // 10 minutes for OTP requests
}

export function checkRateLimit(identifier: string, type: 'login' | 'otp' = 'login'): {
  allowed: boolean
  remainingAttempts: number
  blockedUntil?: number
  message?: string
} {
  const now = Date.now()
  const entry = rateLimitStore.get(`${type}:${identifier}`)
  
  const maxAttempts = type === 'otp' ? RATE_LIMIT_CONFIG.OTP_MAX_REQUESTS : RATE_LIMIT_CONFIG.MAX_ATTEMPTS
  const windowMs = type === 'otp' ? RATE_LIMIT_CONFIG.OTP_WINDOW_MS : RATE_LIMIT_CONFIG.WINDOW_MS

  if (!entry) {
    rateLimitStore.set(`${type}:${identifier}`, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
      blockedUntil: 0,
    })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }

  // Check if currently blocked
  if (entry.blocked && entry.blockedUntil > now) {
    const remainingTime = Math.ceil((entry.blockedUntil - now) / 60000)
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: entry.blockedUntil,
      message: `Too many attempts. Try again in ${remainingTime} minutes.`,
    }
  }

  // Reset if window has passed
  if (now - entry.firstAttempt > windowMs) {
    rateLimitStore.set(`${type}:${identifier}`, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
      blockedUntil: 0,
    })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }

  // Unblock if block duration has passed
  if (entry.blocked && entry.blockedUntil <= now) {
    rateLimitStore.set(`${type}:${identifier}`, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
      blockedUntil: 0,
    })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }

  // Increment count
  entry.count++
  entry.lastAttempt = now

  // Check if should be blocked
  if (entry.count >= maxAttempts) {
    entry.blocked = true
    entry.blockedUntil = now + RATE_LIMIT_CONFIG.BLOCK_DURATION_MS
    rateLimitStore.set(`${type}:${identifier}`, entry)
    
    const remainingTime = Math.ceil(RATE_LIMIT_CONFIG.BLOCK_DURATION_MS / 60000)
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: entry.blockedUntil,
      message: `Too many attempts. Account locked for ${remainingTime} minutes.`,
    }
  }

  rateLimitStore.set(`${type}:${identifier}`, entry)
  return { allowed: true, remainingAttempts: maxAttempts - entry.count }
}

export function resetRateLimit(identifier: string, type: 'login' | 'otp' = 'login'): void {
  rateLimitStore.delete(`${type}:${identifier}`)
}

// ================================
// Input Sanitization
// ================================

export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Escape special characters
    .replace(/[&<>"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      }
      return escapeMap[char] || char
    })
    // Remove potential SQL injection patterns
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi, '')
    // Remove potential script injections
    .replace(/(javascript:|data:|vbscript:)/gi, '')
}

export function sanitizePhone(phone: string): string {
  // Only allow digits
  return phone.replace(/\D/g, '')
}

export function sanitizeEmail(email: string): string {
  if (!email) return ''
  return email.trim().toLowerCase()
}

// ================================
// Token Management
// ================================

export function generateSecureToken(): string {
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array)
  } else {
    // Fallback for SSR
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = generateSecureToken().substring(0, 16)
  return `session_${timestamp}_${randomPart}`
}

// ================================
// Session Security
// ================================

interface Session {
  id: string
  userId: string
  createdAt: number
  lastActivity: number
  expiresAt: number
  deviceInfo?: string
  ipAddress?: string
}

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours
const SESSION_INACTIVE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes inactivity

export function createSession(userId: string, deviceInfo?: string): Session {
  const now = Date.now()
  return {
    id: generateSessionId(),
    userId,
    createdAt: now,
    lastActivity: now,
    expiresAt: now + SESSION_DURATION_MS,
    deviceInfo,
  }
}

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false
  
  const now = Date.now()
  
  // Check if session has expired
  if (now > session.expiresAt) return false
  
  // Check if session has been inactive for too long
  if (now - session.lastActivity > SESSION_INACTIVE_TIMEOUT_MS) return false
  
  return true
}

export function refreshSession(session: Session): Session {
  const now = Date.now()
  return {
    ...session,
    lastActivity: now,
  }
}

// ================================
// Device Fingerprinting (Basic)
// ================================

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server'
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency?.toString() || 'unknown',
  ]
  
  // Simple hash
  let hash = 0
  const str = components.join('|')
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return 'device_' + Math.abs(hash).toString(36)
}

// ================================
// Remembered Credentials
// ================================

export interface RememberedCredential {
  identifier: string // phone or email (hashed display)
  type: 'phone' | 'email'
  fullValue: string // actual phone/email
  countryCode?: string
  lastLogin: number
  deviceFingerprint: string
  userName?: string
}

const REMEMBERED_CREDS_KEY = 'sangman_remembered_credentials'

export function saveRememberedCredential(credential: Omit<RememberedCredential, 'deviceFingerprint' | 'lastLogin'>): void {
  if (typeof window === 'undefined') return
  
  const fingerprint = getDeviceFingerprint()
  const existingCreds = getRememberedCredentials()
  
  // Remove duplicate if exists
  const filteredCreds = existingCreds.filter(
    c => !(c.type === credential.type && c.fullValue === credential.fullValue)
  )
  
  const newCred: RememberedCredential = {
    ...credential,
    deviceFingerprint: fingerprint,
    lastLogin: Date.now(),
  }
  
  // Keep only last 3 credentials
  const updatedCreds = [newCred, ...filteredCreds].slice(0, 3)
  
  try {
    localStorage.setItem(REMEMBERED_CREDS_KEY, JSON.stringify(updatedCreds))
  } catch (e) {
    console.error('Failed to save remembered credential:', e)
  }
}

export function getRememberedCredentials(): RememberedCredential[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(REMEMBERED_CREDS_KEY)
    if (!stored) return []
    
    const creds = JSON.parse(stored) as RememberedCredential[]
    const fingerprint = getDeviceFingerprint()
    
    // Only return credentials for this device
    return creds.filter(c => c.deviceFingerprint === fingerprint)
  } catch (e) {
    console.error('Failed to get remembered credentials:', e)
    return []
  }
}

export function removeRememberedCredential(fullValue: string): void {
  if (typeof window === 'undefined') return
  
  const existingCreds = getRememberedCredentials()
  const filteredCreds = existingCreds.filter(c => c.fullValue !== fullValue)
  
  try {
    localStorage.setItem(REMEMBERED_CREDS_KEY, JSON.stringify(filteredCreds))
  } catch (e) {
    console.error('Failed to remove remembered credential:', e)
  }
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone
  const last4 = phone.slice(-4)
  const masked = phone.slice(0, -4).replace(/\d/g, '*')
  return masked + last4
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  if (local.length <= 2) return email
  const visiblePart = local.slice(0, 2)
  const masked = visiblePart + '*'.repeat(Math.min(local.length - 2, 5))
  return `${masked}@${domain}`
}

// ================================
// Login Attempt Tracking
// ================================

interface LoginAttempt {
  timestamp: number
  identifier: string
  type: 'phone' | 'email'
  success: boolean
  deviceFingerprint: string
  method: 'otp' | 'password'
}

const LOGIN_ATTEMPTS_KEY = 'sangman_login_attempts'
const MAX_STORED_ATTEMPTS = 20

export function recordLoginAttempt(attempt: Omit<LoginAttempt, 'timestamp' | 'deviceFingerprint'>): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    const attempts: LoginAttempt[] = stored ? JSON.parse(stored) : []
    
    const newAttempt: LoginAttempt = {
      ...attempt,
      timestamp: Date.now(),
      deviceFingerprint: getDeviceFingerprint(),
    }
    
    // Keep only last N attempts
    const updatedAttempts = [newAttempt, ...attempts].slice(0, MAX_STORED_ATTEMPTS)
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(updatedAttempts))
  } catch (e) {
    console.error('Failed to record login attempt:', e)
  }
}

export function getRecentLoginAttempts(identifier: string): LoginAttempt[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    if (!stored) return []
    
    const attempts: LoginAttempt[] = JSON.parse(stored)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    
    return attempts.filter(
      a => a.identifier === identifier && a.timestamp > oneDayAgo
    )
  } catch (e) {
    return []
  }
}

// ================================
// Security Headers (for API calls)
// ================================

export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
}


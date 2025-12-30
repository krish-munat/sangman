// Shared in-memory OTP storage
// In production, replace with Redis or database

interface OTPData {
  otp: string
  expiresAt: Date
  attempts: number
}

// Global storage that persists across API routes
// Using globalThis to ensure storage persists across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _otpStorage: Map<string, OTPData> | undefined
}

// Always use global storage
if (!global._otpStorage) {
  global._otpStorage = new Map<string, OTPData>()
}

export const otpStorage = global._otpStorage

export type { OTPData }


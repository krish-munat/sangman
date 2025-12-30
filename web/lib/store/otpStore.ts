import { create } from 'zustand'
import { 
  OTPData, 
  createOTPData, 
  validateOTP, 
  isOTPExpired,
  isMaxAttemptsExceeded,
  sendOTPViaSMS,
  sendOTPViaEmail,
  OTP_CONFIG,
} from '@/lib/utils/otp'

interface OTPState {
  // Current OTP data
  currentOTP: OTPData | null
  
  // UI State
  isLoading: boolean
  isSending: boolean
  isVerifying: boolean
  error: string | null
  successMessage: string | null
  
  // Resend cooldown
  resendCooldown: number
  canResend: boolean
  
  // Actions
  sendOTP: (channel: 'sms' | 'email', identifier: string, purpose: OTPData['purpose']) => Promise<boolean>
  verifyOTP: (inputOTP: string) => Promise<boolean>
  resendOTP: () => Promise<boolean>
  incrementAttempts: () => void
  clearOTP: () => void
  clearError: () => void
  startResendCooldown: () => void
}

export const useOTPStore = create<OTPState>((set, get) => ({
  currentOTP: null,
  isLoading: false,
  isSending: false,
  isVerifying: false,
  error: null,
  successMessage: null,
  resendCooldown: 0,
  canResend: true,

  sendOTP: async (channel, identifier, purpose) => {
    set({ isSending: true, error: null, successMessage: null })
    
    try {
      // Create new OTP data
      const otpData = createOTPData(channel, identifier, purpose)
      
      // Send OTP via appropriate channel
      const result = channel === 'email' 
        ? await sendOTPViaEmail(identifier, otpData.otp)
        : await sendOTPViaSMS(identifier, otpData.otp)
      
      if (result.success) {
        set({ 
          currentOTP: otpData, 
          isSending: false,
          successMessage: result.message,
          canResend: false,
        })
        
        // Start resend cooldown
        get().startResendCooldown()
        
        return true
      } else {
        set({ isSending: false, error: result.message })
        return false
      }
    } catch (error) {
      set({ 
        isSending: false, 
        error: 'Failed to send OTP. Please try again.' 
      })
      return false
    }
  },

  verifyOTP: async (inputOTP) => {
    const { currentOTP } = get()
    
    if (!currentOTP) {
      set({ error: 'No OTP request found. Please request a new OTP.' })
      return false
    }
    
    set({ isVerifying: true, error: null })
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Increment attempts
    get().incrementAttempts()
    
    // Validate
    const result = validateOTP(inputOTP, currentOTP)
    
    if (result.valid) {
      set({ 
        currentOTP: { ...currentOTP, verified: true },
        isVerifying: false,
        successMessage: 'OTP verified successfully!',
      })
      return true
    } else {
      set({ 
        isVerifying: false, 
        error: result.error || 'Invalid OTP',
      })
      return false
    }
  },

  resendOTP: async () => {
    const { currentOTP, canResend } = get()
    
    if (!canResend) {
      set({ error: 'Please wait before requesting a new OTP' })
      return false
    }
    
    if (!currentOTP) {
      set({ error: 'No previous OTP request found' })
      return false
    }
    
    // Create new OTP with same channel/identifier/purpose
    const identifier = currentOTP.channel === 'email' ? currentOTP.email! : currentOTP.phone!
    return get().sendOTP(currentOTP.channel, identifier, currentOTP.purpose)
  },

  incrementAttempts: () => {
    const { currentOTP } = get()
    if (currentOTP) {
      set({ 
        currentOTP: { 
          ...currentOTP, 
          attempts: currentOTP.attempts + 1 
        } 
      })
    }
  },

  clearOTP: () => {
    set({ 
      currentOTP: null, 
      error: null, 
      successMessage: null,
      isLoading: false,
      isSending: false,
      isVerifying: false,
    })
  },

  clearError: () => {
    set({ error: null })
  },

  startResendCooldown: () => {
    set({ resendCooldown: OTP_CONFIG.resendCooldownSeconds, canResend: false })
    
    const interval = setInterval(() => {
      const { resendCooldown } = get()
      if (resendCooldown <= 1) {
        clearInterval(interval)
        set({ resendCooldown: 0, canResend: true })
      } else {
        set({ resendCooldown: resendCooldown - 1 })
      }
    }, 1000)
  },
}))

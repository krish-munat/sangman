'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  X, Phone, Mail, CheckCircle, AlertCircle, Loader2, RefreshCw, 
  Shield, Lock, Clock, Sparkles, ArrowRight
} from 'lucide-react'
import OTPInput from './OTPInput'
import { useOTPStore } from '@/lib/store/otpStore'
import { maskPhoneNumber, maskEmail, formatTimeRemaining, OTP_CONFIG } from '@/lib/utils/otp'

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  phone?: string
  email?: string
  channel: 'sms' | 'email'
  purpose: 'login' | 'register' | 'reset-password' | 'verify-phone' | 'verify-email'
  title?: string
  subtitle?: string
}

// Purpose-specific configurations
const PURPOSE_CONFIG = {
  login: {
    icon: Lock,
    gradient: 'from-sky-500 to-cyan-600',
    successMessage: 'Login verified successfully!',
    title: 'Secure Login Verification',
  },
  register: {
    icon: Sparkles,
    gradient: 'from-emerald-500 to-teal-600',
    successMessage: 'Account verified successfully!',
    title: 'Verify Your Account',
  },
  'reset-password': {
    icon: Shield,
    gradient: 'from-amber-500 to-orange-600',
    successMessage: 'Identity verified! You can reset your password.',
    title: 'Verify Your Identity',
  },
  'verify-phone': {
    icon: Phone,
    gradient: 'from-violet-500 to-purple-600',
    successMessage: 'Phone number verified!',
    title: 'Verify Phone Number',
  },
  'verify-email': {
    icon: Mail,
    gradient: 'from-pink-500 to-rose-600',
    successMessage: 'Email address verified!',
    title: 'Verify Email Address',
  },
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  phone,
  email,
  channel,
  purpose,
  title,
  subtitle,
}: OTPVerificationModalProps) {
  const [otpValue, setOtpValue] = useState('')
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isAnimatingSuccess, setIsAnimatingSuccess] = useState(false)
  
  const {
    currentOTP,
    isSending,
    isVerifying,
    error,
    successMessage,
    resendCooldown,
    canResend,
    sendOTP,
    verifyOTP,
    resendOTP,
    clearError,
    clearOTP,
  } = useOTPStore()

  const identifier = channel === 'email' ? email! : phone!
  const config = PURPOSE_CONFIG[purpose]
  const PurposeIcon = config.icon
  
  const displayTitle = title || config.title
  const displaySubtitle = subtitle || `Enter the ${OTP_CONFIG.length}-digit verification code sent to your ${channel === 'email' ? 'email address' : 'phone number'}`

  // Send OTP when modal opens
  useEffect(() => {
    if (isOpen && !currentOTP) {
      sendOTP(channel, identifier, purpose)
    }
  }, [isOpen, channel, identifier, purpose, currentOTP, sendOTP])

  // Update time remaining
  useEffect(() => {
    if (!currentOTP) return

    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(currentOTP.expiresAt))
    }, 1000)

    return () => clearInterval(interval)
  }, [currentOTP])

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    setOtpValue('')
    setIsAnimatingSuccess(false)
    clearOTP()
    onClose()
  }, [clearOTP, onClose])

  // Handle OTP completion
  const handleOTPComplete = useCallback(async (otp: string) => {
    const success = await verifyOTP(otp)
    if (success) {
      setIsAnimatingSuccess(true)
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    }
  }, [verifyOTP, onSuccess, handleClose])

  // Handle verify button click
  const handleVerify = useCallback(async () => {
    if (otpValue.length === OTP_CONFIG.length) {
      await handleOTPComplete(otpValue)
    }
  }, [otpValue, handleOTPComplete])

  // Handle resend
  const handleResend = useCallback(async () => {
    setOtpValue('')
    clearError()
    await resendOTP()
  }, [clearError, resendOTP])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'Enter' && otpValue.length === OTP_CONFIG.length && !isVerifying) {
        handleVerify()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, otpValue, isVerifying, handleClose, handleVerify])

  if (!isOpen) return null

  const isVerified = currentOTP?.verified || isAnimatingSuccess

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
    >
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header with gradient */}
        <div className={`relative bg-gradient-to-r ${config.gradient} px-6 py-8 text-white overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close verification modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative flex items-center gap-5">
            <div className="w-18 h-18 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg w-[72px] h-[72px]">
              <PurposeIcon className="w-9 h-9" />
            </div>
            <div>
              <h2 id="otp-modal-title" className="text-2xl font-bold">{displayTitle}</h2>
              <p className="text-white/80 text-sm mt-1 max-w-xs">
                {displaySubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Phone/Email Info Card */}
          <div className="flex items-center justify-center gap-3 mb-6 py-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              channel === 'email' ? 'bg-purple-100' : 'bg-sky-100'
            }`}>
              {channel === 'email' ? (
                <Mail className="w-5 h-5 text-purple-600" />
              ) : (
                <Phone className="w-5 h-5 text-sky-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Sent to</p>
              <p className="text-gray-900 font-semibold">
                {channel === 'email' ? maskEmail(email!) : maskPhoneNumber(phone!)}
              </p>
            </div>
          </div>

          {/* Success State */}
          {isVerified ? (
            <div className="text-center py-10">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30 animate-check-bounce">
                <CheckCircle className="w-14 h-14 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.successMessage}</h3>
              <p className="text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting you now...
              </p>
            </div>
          ) : (
            <>
              {/* OTP Input */}
              <div className="mb-6">
                <OTPInput
                  value={otpValue}
                  onChange={(value) => {
                    setOtpValue(value)
                    if (error) clearError()
                  }}
                  onComplete={handleOTPComplete}
                  disabled={isSending || isVerifying}
                  error={!!error}
                  autoFocus
                />
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-4 animate-in fade-in slide-in-from-top-2 duration-200"
                  role="alert"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-red-700 font-medium text-sm">Verification Failed</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message (before full verification) */}
              {successMessage && !error && (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-emerald-700 text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {/* Timer */}
              {currentOTP && (
                <div className="text-center mb-5">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Code expires in{' '}
                      <span className="font-bold text-gray-800">{timeRemaining}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Demo Notice */}
              {OTP_CONFIG.demoMode && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-amber-800 text-sm font-medium">Demo Mode Active</p>
                      <p className="text-amber-700 text-sm">
                        Use code: <span className="font-bold font-mono bg-amber-100 px-2 py-0.5 rounded">{OTP_CONFIG.demoOTP}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={otpValue.length !== OTP_CONFIG.length || isVerifying || isSending}
                className={`
                  w-full py-4 rounded-2xl font-bold text-white text-base
                  flex items-center justify-center gap-3
                  transition-all duration-300 ripple-effect
                  ${otpValue.length === OTP_CONFIG.length && !isVerifying && !isSending
                    ? `bg-gradient-to-r ${config.gradient} hover:opacity-90 shadow-lg hover:shadow-xl active:scale-[0.98]`
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500
                `}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-3">Didn't receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={!canResend || isSending}
                  className={`
                    inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                    transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
                    ${canResend && !isSending
                      ? 'text-sky-600 hover:bg-sky-50 border border-sky-200 hover:border-sky-300'
                      : 'text-gray-400 cursor-not-allowed border border-gray-200'
                    }
                  `}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : canResend ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend Code
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      Resend in {resendCooldown}s
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Secured with 256-bit encryption
          </p>
        </div>
      </div>
    </div>
  )
}

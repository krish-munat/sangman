'use client'

import { useState, useEffect } from 'react'
import { X, Phone, Mail, CheckCircle, AlertCircle, Loader2, RefreshCw, Shield } from 'lucide-react'
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
  const displayTitle = title || (channel === 'email' ? 'Verify Your Email' : 'Verify Your Phone')
  const displaySubtitle = subtitle || `Enter the ${OTP_CONFIG.length}-digit code sent to your ${channel === 'email' ? 'email' : 'phone'}`

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

  // Handle close
  const handleClose = () => {
    setOtpValue('')
    clearOTP()
    onClose()
  }

  // Handle OTP completion
  const handleOTPComplete = async (otp: string) => {
    const success = await verifyOTP(otp)
    if (success) {
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1500)
    }
  }

  // Handle verify button click
  const handleVerify = async () => {
    if (otpValue.length === OTP_CONFIG.length) {
      await handleOTPComplete(otpValue)
    }
  }

  // Handle resend
  const handleResend = async () => {
    setOtpValue('')
    clearError()
    await resendOTP()
  }

  if (!isOpen) return null

  const isVerified = currentOTP?.verified

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-sky-500 to-emerald-500 px-6 py-8 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              {channel === 'email' ? <Mail className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{displayTitle}</h2>
              <p className="text-white/80 text-sm mt-1">
                {displaySubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Phone/Email Info */}
          <div className="flex items-center justify-center gap-2 mb-6 py-3 bg-gray-50 rounded-xl">
            {channel === 'email' ? (
              <>
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">{maskEmail(email!)}</span>
              </>
            ) : (
              <>
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">{maskPhoneNumber(phone!)}</span>
              </>
            )}
          </div>

          {/* Success State */}
          {isVerified ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Successfully!</h3>
              <p className="text-gray-600">Redirecting you...</p>
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
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && !error && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-emerald-600 text-sm">{successMessage}</p>
                </div>
              )}

              {/* Timer */}
              {currentOTP && (
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500">
                    Code expires in{' '}
                    <span className="font-semibold text-gray-700">{timeRemaining}</span>
                  </p>
                </div>
              )}

              {/* Demo Notice */}
              {OTP_CONFIG.demoMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <p className="text-amber-700 text-sm text-center">
                    🔐 Demo Mode: Use OTP <span className="font-bold">{OTP_CONFIG.demoOTP}</span>
                  </p>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={otpValue.length !== OTP_CONFIG.length || isVerifying || isSending}
                className={`
                  w-full py-3.5 rounded-xl font-semibold text-white
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${otpValue.length === OTP_CONFIG.length && !isVerifying && !isSending
                    ? 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify OTP
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResend}
                  disabled={!canResend || isSending}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${canResend && !isSending
                      ? 'text-sky-600 hover:bg-sky-50'
                      : 'text-gray-400 cursor-not-allowed'
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
                      Resend OTP
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend in {resendCooldown}s
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


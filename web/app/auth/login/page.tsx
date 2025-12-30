'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Phone, Stethoscope, Shield, ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import toast from 'react-hot-toast'
import OTPInput from '@/components/auth/OTPInput'

// Strict phone validation schema - exactly 10 digits
const loginSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'patient'
  
  // States
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const { login, isAuthenticated, isHydrated } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const watchPhone = watch('phone')

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const userRole = useAuthStore.getState().user?.role
      if (userRole === 'patient') router.push('/patient')
      else if (userRole === 'doctor') router.push('/doctor/dashboard')
      else if (userRole === 'admin') router.push('/admin/dashboard')
    }
  }, [isHydrated, isAuthenticated, router])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleSendOTP = async (data: LoginFormData) => {
    setIsSendingOTP(true)
    try {
      const fullPhone = `+91${data.phone}`
      
      // Generate OTP on client for demo (in production, server generates)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Call API to send OTP
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'sms',
          phone: fullPhone,
          otp: generatedOtp,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPhoneNumber(data.phone)
        setStep('otp')
        setResendTimer(30)
        toast.success(`OTP sent to +91 ${data.phone.slice(0, 3)}****${data.phone.slice(-3)}`)
        
        // For demo: show OTP in console and toast
        console.log(`[DEMO] Your OTP is: ${generatedOtp}`)
        toast(`Demo OTP: ${generatedOtp}`, { icon: '🔐', duration: 10000 })
      } else {
        toast.error(result.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSendingOTP(false)
    }
  }

  const handleVerifyOTP = useCallback(async (otpValue: string) => {
    if (otpValue.length !== 6) return

    setIsLoading(true)
    setOtpError(false)

    try {
      const fullPhone = `+91${phoneNumber}`
      
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: fullPhone,
          otp: otpValue,
          purpose: 'login',
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Create user session
        const mockUser = {
          id: `user-${Date.now()}`,
          phone: fullPhone,
          email: '',
          role: role as 'patient' | 'doctor' | 'admin',
          name: role === 'doctor' ? 'Dr. User' : role === 'admin' ? 'Admin' : 'Patient',
          profileComplete: false, // Mark as incomplete for new users
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        login(mockUser, `jwt-${Date.now()}`)
        toast.success('Login successful!')

        // Redirect based on role
        setTimeout(() => {
          if (role === 'patient') router.push('/patient')
          else if (role === 'doctor') router.push('/doctor/dashboard')
          else if (role === 'admin') router.push('/admin/dashboard')
        }, 100)
      } else {
        setOtpError(true)
        toast.error(result.message || 'Invalid OTP')
      }
    } catch (error) {
      setOtpError(true)
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [phoneNumber, role, login, router])

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    
    setIsSendingOTP(true)
    try {
      const fullPhone = `+91${phoneNumber}`
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'sms',
          phone: fullPhone,
          otp: generatedOtp,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setResendTimer(30)
        setOtp('')
        setOtpError(false)
        toast.success('New OTP sent!')
        console.log(`[DEMO] Your new OTP is: ${generatedOtp}`)
        toast(`Demo OTP: ${generatedOtp}`, { icon: '🔐', duration: 10000 })
      }
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setIsSendingOTP(false)
    }
  }

  const getRoleConfig = () => {
    switch (role) {
      case 'doctor':
        return {
          icon: Stethoscope,
          title: 'Doctor Portal',
          subtitle: 'Access your practice dashboard',
          gradient: 'from-emerald-500 to-teal-600',
          bgGradient: 'from-emerald-50 to-teal-50',
        }
      case 'admin':
        return {
          icon: Shield,
          title: 'Admin Portal',
          subtitle: 'Platform administration',
          gradient: 'from-purple-500 to-indigo-600',
          bgGradient: 'from-purple-50 to-indigo-50',
        }
      default:
        return {
          icon: Heart,
          title: 'Welcome to Sangman',
          subtitle: 'Your health journey starts here',
          gradient: 'from-sky-500 to-cyan-600',
          bgGradient: 'from-sky-50 to-cyan-50',
        }
    }
  }

  const roleConfig = getRoleConfig()
  const Icon = roleConfig.icon

  return (
    <div className={`min-h-screen flex bg-gradient-to-br ${roleConfig.bgGradient}`}>
      {/* Left Side - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${roleConfig.gradient} p-12 flex-col justify-between relative overflow-hidden`}>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
            <span className="text-3xl font-bold text-white">SANGMAN</span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Healthcare Made <br />Simple & Accessible
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-md">
            Join thousands of patients and doctors who trust Sangman for seamless healthcare delivery.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>100% Verified Doctors</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Instant Appointment Booking</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Secure Escrow Payments</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className={`w-10 h-10 bg-gradient-to-br ${roleConfig.gradient} rounded-xl flex items-center justify-center`}>
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className={`text-2xl font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent`}>
              SANGMAN
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 lg:p-10">
            {/* Header */}
            <div className="flex items-center justify-center mb-2">
              <div className={`w-14 h-14 bg-gradient-to-br ${roleConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-center text-2xl font-bold text-gray-900 mb-1">
              {roleConfig.title}
            </h1>
            <p className="text-center text-gray-500 mb-8">
              {roleConfig.subtitle}
            </p>

            {step === 'phone' ? (
              /* Phone Input Step */
              <form onSubmit={handleSubmit(handleSendOTP)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex">
                    {/* Fixed +91 Prefix */}
                    <div className="flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-medium">
                      <span className="text-lg mr-1">🇮🇳</span>
                      +91
                    </div>
                    {/* Phone Input */}
                    <input
                      {...register('phone')}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter 10-digit number"
                      className={`flex-1 px-4 py-3.5 text-lg border rounded-r-xl focus:outline-none focus:ring-2 transition-all
                        ${errors.phone 
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-sky-200 focus:border-sky-500'
                        }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {errors.phone.message}
                    </p>
                  )}
                  {watchPhone?.length === 10 && !errors.phone && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Valid phone number
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isValid || isSendingOTP}
                  className={`w-full rounded-xl bg-gradient-to-r ${roleConfig.gradient} py-4 text-base font-semibold text-white 
                    hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                    flex items-center justify-center gap-2 shadow-lg`}
                >
                  {isSendingOTP ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-sky-600 hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-sky-600 hover:underline">Privacy Policy</Link>
                </p>
              </form>
            ) : (
              /* OTP Verification Step */
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    +91 {phoneNumber}
                  </p>
                  <button
                    onClick={() => { setStep('phone'); setOtp(''); setOtpError(false) }}
                    className="text-sky-600 text-sm hover:underline mt-1"
                  >
                    Change number
                  </button>
                </div>

                <div className="py-4">
                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={(val) => { setOtp(val); setOtpError(false) }}
                    onComplete={handleVerifyOTP}
                    error={otpError}
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {otpError && (
                  <p className="text-center text-red-500 text-sm">
                    Invalid OTP. Please try again.
                  </p>
                )}

                <button
                  onClick={() => handleVerifyOTP(otp)}
                  disabled={otp.length !== 6 || isLoading}
                  className={`w-full rounded-xl bg-gradient-to-r ${roleConfig.gradient} py-4 text-base font-semibold text-white 
                    hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                    flex items-center justify-center gap-2 shadow-lg`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-gray-500 text-sm">
                    Didn't receive the code?{' '}
                    {resendTimer > 0 ? (
                      <span className="text-gray-400">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOTP}
                        disabled={isSendingOTP}
                        className="text-sky-600 font-medium hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Role Switch */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-center text-gray-500 mb-3">Switch portal:</p>
              <div className="flex gap-2">
                {[
                  { role: 'patient', label: 'Patient', gradient: 'from-sky-500 to-cyan-600' },
                  { role: 'doctor', label: 'Doctor', gradient: 'from-emerald-500 to-teal-600' },
                  { role: 'admin', label: 'Admin', gradient: 'from-purple-500 to-indigo-600' },
                ].map((r) => (
                  <Link
                    key={r.role}
                    href={`/auth/login?role=${r.role}`}
                    className={`flex-1 text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                      role === r.role
                        ? `bg-gradient-to-r ${r.gradient} text-white shadow-md`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}

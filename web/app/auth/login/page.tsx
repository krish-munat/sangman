'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, Lock, Stethoscope, Shield, ArrowRight, Sparkles, Smartphone } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import toast from 'react-hot-toast'
import AuthInput from '@/components/auth/AuthInput'
import PhoneInput from '@/components/auth/PhoneInput'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import SimpleLanguageSwitcher from '@/components/SimpleLanguageSwitcher'
import { validatePhoneByCountry, formatPhoneWithCountryCode } from '@/lib/utils/validation'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phone: z.string().optional(),
  otp: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'patient'
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, isHydrated } = useAuthStore()

  // OTP Modal state
  const [showOTPModal, setShowOTPModal] = useState(false)

  // Phone input state
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneValue, setPhoneValue] = useState('')
  const [phoneError, setPhoneError] = useState<string | undefined>()
  
  // Email OTP state
  const [emailForOTP, setEmailForOTP] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const userRole = useAuthStore.getState().user?.role
      if (userRole === 'patient') router.push('/patient')
      else if (userRole === 'doctor') router.push('/doctor/dashboard')
      else if (userRole === 'admin') router.push('/admin/dashboard')
    }
  }, [isHydrated, isAuthenticated, router])

  const handlePhoneChange = (phone: string) => {
    setPhoneValue(phone)
    setValue('phone', phone)
    
    if (phone.length > 0) {
      const validation = validatePhoneByCountry(phone, countryCode)
      setPhoneError(validation.error)
    } else {
      setPhoneError(undefined)
    }
  }

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code)
    if (phoneValue.length > 0) {
      const validation = validatePhoneByCountry(phoneValue, code)
      setPhoneError(validation.error)
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockUser = {
        id: 'user-' + Date.now(),
        email: data.email || 'user@test.com',
        phone: '+919876543210',
        role: role as 'patient' | 'doctor' | 'admin',
        name: role === 'doctor' ? 'Dr. Test User' : role === 'admin' ? 'Admin User' : 'Test Patient',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      login(mockUser, 'mock-token-' + Date.now())
      toast.success(`Welcome back, ${mockUser.name}!`)

      // Redirect based on role
      setTimeout(() => {
        if (role === 'patient') router.push('/patient')
        else if (role === 'doctor') router.push('/doctor/dashboard')
        else if (role === 'admin') router.push('/admin/dashboard')
      }, 100)
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError(undefined)
    return true
  }

  // Handle OTP Login - Opens verification modal
  const handleOTPLogin = () => {
    if (otpChannel === 'email') {
      // Validate email before opening OTP modal
      if (!validateEmail(emailForOTP)) {
        toast.error('Please enter a valid email address')
        return
      }
    } else {
      // Validate phone before opening OTP modal
      const phoneValidation = validatePhoneByCountry(phoneValue, countryCode)
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error)
        toast.error(phoneValidation.error || 'Please enter a valid phone number')
        return
      }
    }

    setShowOTPModal(true)
  }

  // Handle OTP verification success
  const handleOTPSuccess = () => {
    const fullPhone = otpChannel === 'phone' ? formatPhoneWithCountryCode(phoneValue, countryCode) : ''
    
    const mockUser = {
      id: 'user-' + Date.now(),
      email: otpChannel === 'email' ? emailForOTP : '',
      phone: fullPhone,
      role: role as 'patient' | 'doctor' | 'admin',
      name: role === 'doctor' ? 'Dr. Test User' : role === 'admin' ? 'Admin User' : 'Test Patient',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    login(mockUser, 'mock-token-' + Date.now())
    toast.success(`Welcome back, ${mockUser.name}!`)

    // Redirect based on role
    setTimeout(() => {
      if (role === 'patient') router.push('/patient')
      else if (role === 'doctor') router.push('/doctor/dashboard')
      else if (role === 'admin') router.push('/admin/dashboard')
    }, 100)
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
          title: 'Welcome Back',
          subtitle: 'Your health journey continues here',
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
            Healthcare Made Simple<br />& Accessible
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
            <span>Fast Customer Support</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Language Switcher - Fixed Position */}
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50">
          <SimpleLanguageSwitcher />
        </div>

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

            {/* Login Method Toggle */}
            <div className="flex gap-2 mb-8 p-1.5 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  loginMethod === 'password'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Lock className="w-4 h-4" />
                Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  loginMethod === 'otp'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                OTP Login
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <AuthInput
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <AuthInput
                  label="Password"
                  type="password"
                  icon={Lock}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full rounded-xl bg-gradient-to-r ${roleConfig.gradient} py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                {/* OTP Channel Toggle */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOtpChannel('phone')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      otpChannel === 'phone'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    Phone OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpChannel('email')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      otpChannel === 'email'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email OTP
                  </button>
                </div>

                {otpChannel === 'phone' ? (
                  <PhoneInput
                    label="Phone Number"
                    countryCode={countryCode}
                    onCountryCodeChange={handleCountryCodeChange}
                    onPhoneChange={handlePhoneChange}
                    error={phoneError}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={emailForOTP}
                        onChange={(e) => {
                          setEmailForOTP(e.target.value)
                          if (emailError) setEmailError(undefined)
                        }}
                        placeholder="Enter your email address"
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                          emailError 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-200 focus:border-sky-500'
                        } focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all`}
                      />
                    </div>
                    {emailError && (
                      <p className="mt-1.5 text-sm text-red-500">{emailError}</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOTPLogin}
                  disabled={otpChannel === 'phone' ? !phoneValue : !emailForOTP}
                  className={`w-full rounded-xl bg-gradient-to-r ${roleConfig.gradient} py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
                >
                  {otpChannel === 'phone' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  Send OTP & Login
                </button>

                <p className="text-xs text-center text-gray-500">
                  We'll send a 6-digit verification code to your {otpChannel === 'phone' ? 'phone' : 'email'}
                </p>
              </div>
            )}

            <div className="mt-8 text-center space-y-3">
              <Link href="/auth/forgot-password" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                Forgot Password?
              </Link>
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href={`/auth/register?role=${role}`} className="text-sky-600 hover:text-sky-700 font-semibold">
                  Sign up free
                </Link>
              </p>
            </div>

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

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onSuccess={handleOTPSuccess}
        phone={otpChannel === 'phone' ? formatPhoneWithCountryCode(phoneValue, countryCode) : undefined}
        email={otpChannel === 'email' ? emailForOTP : undefined}
        channel={otpChannel === 'phone' ? 'sms' : 'email'}
        purpose="login"
      />
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

'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, User, Stethoscope, ArrowRight, CheckCircle, Building2, Sparkles, Shield, Smartphone, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import toast from 'react-hot-toast'
import AuthInput from '@/components/auth/AuthInput'
import PhoneInput from '@/components/auth/PhoneInput'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import { validatePhoneByCountry, formatPhoneWithCountryCode } from '@/lib/utils/validation'
import { 
  checkRateLimit, 
  resetRateLimit,
  sanitizeInput,
  sanitizeEmail,
  saveRememberedCredential,
  recordLoginAttempt,
  generateSecureToken,
  maskPhone,
  maskEmail,
} from '@/lib/utils/security'

// User database simulation
const USERS_DB_KEY = 'sangman_users_db'

interface StoredUser {
  id: string
  phone?: string
  email?: string
  name: string
  role: 'patient' | 'doctor' | 'admin'
  verified: boolean
  createdAt: string
}

function getUsersDB(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(USERS_DB_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function findUser(identifier: string, type: 'phone' | 'email'): StoredUser | undefined {
  const users = getUsersDB()
  return users.find(u => 
    type === 'phone' ? u.phone === identifier : u.email === identifier
  )
}

function createUser(data: { phone: string; email: string; name: string; role: 'patient' | 'doctor' | 'admin' }): StoredUser {
  const users = getUsersDB()
  
  const newUser: StoredUser = {
    id: 'user_' + generateSecureToken().substring(0, 16),
    phone: data.phone,
    email: data.email,
    name: data.name,
    role: data.role,
    verified: true,
    createdAt: new Date().toISOString(),
  }
  
  users.push(newUser)
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
  return newUser
}

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
})

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'patient'
  const { login } = useAuthStore()

  const [countryCode, setCountryCode] = useState('+91')
  const [phoneValue, setPhoneValue] = useState('')
  const [phoneError, setPhoneError] = useState<string | undefined>()
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone')
  
  // OTP Verification state
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<RegisterFormData | null>(null)
  
  // Rate limiting
  const [rateLimitError, setRateLimitError] = useState<string | undefined>()
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })
  
  const emailValue = watch('email')

  const onSubmit = async (data: RegisterFormData) => {
    const fullPhone = formatPhoneWithCountryCode(phoneValue, countryCode)
    const identifier = otpChannel === 'phone' ? fullPhone : data.email

    // Check rate limit
    const rateCheck = checkRateLimit(identifier, 'otp')
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.message)
      toast.error(rateCheck.message || 'Too many attempts')
      return
    }
    setRemainingAttempts(rateCheck.remainingAttempts)

    // Validate phone if using phone OTP
    if (otpChannel === 'phone') {
      const phoneValidation = validatePhoneByCountry(phoneValue, countryCode)
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error)
        toast.error(phoneValidation.error || 'Invalid phone number')
        return
      }
    }

    // Check if user already exists
    const existingUser = findUser(identifier, otpChannel)
    if (existingUser) {
      toast.error(`An account with this ${otpChannel} already exists. Please login instead.`)
      router.push(`/auth/login?role=${role}`)
      return
    }

    // Record attempt
    recordLoginAttempt({
      identifier,
      type: otpChannel,
      success: false,
      method: 'otp',
    })

    // Store pending registration data and open OTP modal
    setPendingRegistration({
      ...data,
      name: sanitizeInput(data.name),
      email: sanitizeEmail(data.email),
    })
    setShowOTPModal(true)
  }

  // Handle OTP verification success - complete registration
  const handleOTPSuccess = () => {
    if (!pendingRegistration) return

    try {
      const fullPhone = formatPhoneWithCountryCode(phoneValue, countryCode)
      const identifier = otpChannel === 'phone' ? fullPhone : pendingRegistration.email

      // Reset rate limit on success
      resetRateLimit(identifier, 'otp')

      // Create user
      const newUser = createUser({
        phone: fullPhone,
        email: pendingRegistration.email,
        name: pendingRegistration.name,
        role: role as 'patient' | 'doctor',
      })

      // Save remembered credential
      saveRememberedCredential({
        identifier: otpChannel === 'phone' ? maskPhone(fullPhone) : maskEmail(pendingRegistration.email),
        type: otpChannel,
        fullValue: identifier,
        countryCode: otpChannel === 'phone' ? countryCode : undefined,
        userName: newUser.name,
      })

      // Record successful registration
      recordLoginAttempt({
        identifier,
        type: otpChannel,
        success: true,
        method: 'otp',
      })

      // Login
      login({
        id: newUser.id,
        email: newUser.email || '',
        phone: newUser.phone || '',
        role: newUser.role,
        name: newUser.name,
        createdAt: newUser.createdAt,
        updatedAt: new Date().toISOString(),
      }, 'token_' + generateSecureToken())

      toast.success(`Welcome, ${newUser.name}! Your account has been created.`)

      if (role === 'doctor') {
        router.push('/doctor/verification')
      } else {
        router.push('/patient')
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    }
  }

  const handlePhoneChange = (phone: string) => {
    setPhoneValue(phone)
    setValue('phone', phone)
    setRateLimitError(undefined)
    
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

  const getRoleConfig = () => {
    if (role === 'doctor') {
      return {
        icon: Stethoscope,
        title: 'Join as Doctor',
        subtitle: 'Start accepting appointments today',
        gradient: 'from-emerald-500 to-teal-600',
        bgGradient: 'from-emerald-50 to-teal-50',
        accentColor: 'emerald'
      }
    }
    return {
      icon: Heart,
      title: 'Create Account',
      subtitle: 'Your health journey starts here',
      gradient: 'from-sky-500 to-cyan-600',
      bgGradient: 'from-sky-50 to-cyan-50',
      accentColor: 'sky'
    }
  }

  const roleConfig = getRoleConfig()
  const Icon = roleConfig.icon

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left Side - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${roleConfig.gradient} p-12 flex-col justify-between relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white heartbeat" fill="white" />
            </div>
            <span className="text-3xl font-bold text-white">SANGMAN</span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {role === 'doctor' ? 'Grow Your Practice' : 'Healthcare at Your Fingertips'}
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-md">
            {role === 'doctor' 
              ? 'Join our network of verified doctors and connect with patients across the region.'
              : 'Access quality healthcare anytime, anywhere. Book appointments with verified doctors.'}
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span>OTP-Verified Registration</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span>No Passwords Required</span>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className={`w-10 h-10 bg-gradient-to-br ${roleConfig.gradient} rounded-xl flex items-center justify-center`}>
              <Heart className="w-6 h-6 text-white heartbeat" fill="white" />
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
            <p className="text-center text-gray-500 mb-6">
              {roleConfig.subtitle}
            </p>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 bg-green-50 rounded-lg">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Secure OTP Registration</span>
            </div>

            {/* Rate Limit Warning */}
            {rateLimitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">Too Many Attempts</p>
                  <p className="text-sm text-red-600">{rateLimitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <AuthInput
                label="Full Name"
                type="text"
                icon={User}
                placeholder="Enter your full name"
                error={errors.name?.message}
                {...register('name')}
              />

              <AuthInput
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="Enter your email"
                error={errors.email?.message}
                {...register('email')}
              />

              <PhoneInput
                label="Phone Number"
                countryCode={countryCode}
                onCountryCodeChange={handleCountryCodeChange}
                onPhoneChange={handlePhoneChange}
                value={phoneValue}
                error={phoneError}
              />

              {/* OTP Verification Channel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verify via
                </label>
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOtpChannel('phone')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
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
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      otpChannel === 'email'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email OTP
                  </button>
                </div>
              </div>

              {/* Remaining Attempts Warning */}
              {remainingAttempts !== undefined && remainingAttempts < 3 && (
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !!rateLimitError}
                className={`w-full rounded-xl bg-gradient-to-r ${roleConfig.gradient} py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Continue & Verify OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                We'll send a 6-digit code to your {otpChannel === 'phone' ? 'phone' : 'email'} to verify your account.
              </p>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href={`/auth/login?role=${role}`} className="text-sky-600 hover:text-sky-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Role Switch */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-center text-gray-500 mb-3">Register as:</p>
              <div className="flex gap-3">
                <Link
                  href="/auth/register?role=patient"
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === 'patient'
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Patient
                </Link>
                <Link
                  href="/auth/register?role=doctor"
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === 'doctor'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Doctor
                </Link>
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
        email={otpChannel === 'email' ? emailValue : undefined}
        channel={otpChannel === 'phone' ? 'sms' : 'email'}
        purpose="register"
      />
    </div>
  )
}

function RegisterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white heartbeat" />
        </div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  )
}

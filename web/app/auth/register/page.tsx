'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, User, Stethoscope, ArrowRight, CheckCircle, Building2, Sparkles, Lock, Smartphone } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import toast from 'react-hot-toast'
import AuthInput from '@/components/auth/AuthInput'
import PhoneInput from '@/components/auth/PhoneInput'
import PasswordInput from '@/components/auth/PasswordInput'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import { validatePhoneByCountry, validatePasswordStrength, formatPhoneWithCountryCode } from '@/lib/utils/validation'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
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
  const [passwordError, setPasswordError] = useState<string | undefined>()
  
  // OTP Verification state
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<RegisterFormData | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const validateForm = (): boolean => {
    let isValid = true

    // Validate phone
    const phoneValidation = validatePhoneByCountry(phoneValue, countryCode)
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error)
      isValid = false
    } else {
      setPhoneError(undefined)
    }

    return isValid
  }

  const onSubmit = async (data: RegisterFormData) => {
    // Custom validation
    const phoneValidation = validatePhoneByCountry(phoneValue, countryCode)
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error)
      toast.error(phoneValidation.error || 'Invalid phone number')
      return
    }

    // Validate password strength
    const passwordStrength = validatePasswordStrength(data.password)
    if (!passwordStrength.isValid) {
      setPasswordError(passwordStrength.errors[0])
      toast.error(passwordStrength.errors[0] || 'Password is too weak')
      return
    }

    // Store pending registration data and open OTP modal
    setPendingRegistration(data)
    setShowOTPModal(true)
  }

  // Handle OTP verification success - complete registration
  const handleOTPSuccess = () => {
    if (!pendingRegistration) return

    try {
      const fullPhone = formatPhoneWithCountryCode(phoneValue, countryCode)
      
      const mockUser = {
        id: 'new-' + Date.now(),
        email: pendingRegistration.email,
        phone: fullPhone,
        role: role as 'patient' | 'doctor',
        name: pendingRegistration.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      login(mockUser, 'mock-token')
      toast.success(`Welcome, ${mockUser.name}! Your account has been created.`)

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
      subtitle: 'Start your healthcare journey',
      gradient: 'from-sky-500 to-cyan-600',
      bgGradient: 'from-sky-50 to-cyan-50',
      accentColor: 'sky'
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
              <Heart className="w-7 h-7 text-white heartbeat" fill="white" />
            </div>
            <span className="text-3xl font-bold text-white">SANGMAN</span>
          </Link>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {role === 'doctor' ? 'Grow Your Practice' : 'Your Health,'}<br />
            {role === 'doctor' ? 'With Sangman' : 'Our Priority'}
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-md">
            {role === 'doctor' 
              ? 'Join our network of verified healthcare professionals and connect with patients across India.'
              : 'Access verified doctors, book appointments instantly, and take control of your health journey.'
            }
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {role === 'doctor' ? (
            <>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span>Manage Your Schedule</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span>Get Verified Badge</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span>Receive Payments Securely</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span>Book Appointments in Seconds</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span>Access Verified Doctors</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span>Save 10% with Subscription</span>
              </div>
            </>
          )}
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

            {/* Doctor Info Banner */}
            {role === 'doctor' && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">Verification Required</p>
                    <p className="text-emerald-700 text-xs mt-0.5">After registration, upload your medical credentials for verification.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Switch */}
            <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 rounded-xl">
              <Link
                href="/auth/register?role=patient"
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-center ${
                  role === 'patient'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Patient
              </Link>
              <Link
                href="/auth/register?role=doctor"
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-center ${
                  role === 'doctor'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Doctor
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <AuthInput
                label="Full Name"
                type="text"
                icon={User}
                error={errors.name?.message}
                {...register('name')}
              />

              <AuthInput
                label="Email Address"
                type="email"
                icon={Mail}
                error={errors.email?.message}
                {...register('email')}
              />

              <PhoneInput
                label="Phone Number"
                countryCode={countryCode}
                onCountryCodeChange={handleCountryCodeChange}
                onPhoneChange={handlePhoneChange}
                error={phoneError || errors.phone?.message}
              />

              <PasswordInput
                label="Password"
                error={passwordError || errors.password?.message}
                showStrengthIndicator={true}
                {...register('password')}
              />

              <AuthInput
                label="Confirm Password"
                type="password"
                icon={Lock}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full rounded-xl bg-gradient-to-r ${roleConfig.gradient} py-3.5 text-sm font-semibold text-white
                hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 shadow-lg mt-6`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    Verify Phone & Create Account
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-3">
                We'll send a verification code to your phone number
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href={`/auth/login?role=${role}`} className="text-sky-600 hover:text-sky-700 font-semibold">
                Sign in
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <Link href="#" className="underline hover:text-gray-600">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="underline hover:text-gray-600">Privacy Policy</Link>
            </p>
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
        phone={formatPhoneWithCountryCode(phoneValue, countryCode)}
        email={pendingRegistration?.email}
        channel="sms"
        purpose="register"
        title="Verify Your Phone"
        subtitle="Enter the 6-digit code sent to your phone to complete registration"
      />
    </div>
  )
}

function RegisterLoading() {
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  )
}

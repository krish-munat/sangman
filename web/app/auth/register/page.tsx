'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Heart, Mail, User, Stethoscope, ArrowRight, ArrowLeft, CheckCircle, 
  Shield, Smartphone, AlertTriangle, Calendar, MapPin, 
  Droplets, Users, Phone, Lock, Sparkles, Building2, UserPlus, Info
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import toast from 'react-hot-toast'
import AuthInput from '@/components/auth/AuthInput'
import PhoneInput from '@/components/auth/PhoneInput'
import DateInput from '@/components/auth/DateInput'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import SimpleLanguageSwitcher from '@/components/SimpleLanguageSwitcher'
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

// ================================
// Constants & Types
// ================================

const USERS_DB_KEY = 'sangman_users_db'

const BLOOD_GROUPS = [
  { value: '', label: 'Select Blood Group (Optional)' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'unknown', label: "Don't Know" },
] as const

const GENDERS = [
  { value: 'male', label: 'Male', icon: '👨' },
  { value: 'female', label: 'Female', icon: '👩' },
  { value: 'other', label: 'Other', icon: '🧑' },
] as const

const RELATIONS = [
  'Father', 'Mother', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'
] as const

interface StoredUser {
  id: string
  phone?: string
  email?: string
  name: string
  dateOfBirth?: string
  gender?: string
  bloodGroup?: string
  address?: {
    city?: string
    state?: string
    country?: string
    pincode?: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  role: 'patient' | 'doctor' | 'admin'
  verified: boolean
  createdAt: string
  lastLogin?: string
}

// ================================
// Database Utilities
// ================================

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

function createUser(data: Omit<StoredUser, 'id' | 'verified' | 'createdAt'>): StoredUser {
  const users = getUsersDB()
  
  const newUser: StoredUser = {
    ...data,
    id: 'user_' + generateSecureToken().substring(0, 16),
    verified: true,
    createdAt: new Date().toISOString(),
  }
  
  users.push(newUser)
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
  return newUser
}

// ================================
// Validation Schema
// ================================

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z.string()
    .email('Please enter a valid email address'),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const dob = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      return age >= 0 && age <= 120
    }, 'Please enter a valid date of birth'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select your gender',
  }),
  bloodGroup: z.string().optional(),
  city: z.string()
    .min(2, 'City name is required')
    .max(100, 'City name is too long'),
  state: z.string().optional(),
  pincode: z.string()
    .regex(/^\d{5,10}$/, 'Please enter a valid PIN/ZIP code')
    .optional()
    .or(z.literal('')),
  emergencyName: z.string()
    .min(2, 'Emergency contact name is required')
    .max(100, 'Name is too long'),
  emergencyRelation: z.string()
    .min(2, 'Please specify the relation'),
})

type RegisterFormData = z.infer<typeof registerSchema>

// ================================
// Main Component
// ================================

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get('role') || 'patient') as 'patient' | 'doctor'
  const prefillPhone = searchParams.get('phone') || ''
  const prefillCountryCode = searchParams.get('countryCode') || '+91'
  const prefillEmail = searchParams.get('email') || ''
  const { login } = useAuthStore()

  // Form step state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  // Phone states
  const [countryCode, setCountryCode] = useState(prefillCountryCode)
  const [phoneValue, setPhoneValue] = useState(prefillPhone)
  const [phoneError, setPhoneError] = useState<string | undefined>()
  const [phoneValid, setPhoneValid] = useState(false)

  // Emergency phone states
  const [emergencyCountryCode, setEmergencyCountryCode] = useState('+91')
  const [emergencyPhoneValue, setEmergencyPhoneValue] = useState('')
  const [emergencyPhoneError, setEmergencyPhoneError] = useState<string | undefined>()

  // OTP states
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>(prefillEmail ? 'email' : 'phone')
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<RegisterFormData | null>(null)
  
  // Rate limiting
  const [rateLimitError, setRateLimitError] = useState<string | undefined>()
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>()

  // Animation state
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: prefillEmail,
      gender: undefined,
      bloodGroup: '',
    },
    mode: 'onChange',
  })

  const watchedValues = watch()

  // Validate current step before proceeding
  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      const result = await trigger(['name', 'email', 'dateOfBirth', 'gender'])
      const phoneValidation = validatePhoneByCountry(phoneValue, countryCode)
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error)
        return false
      }
      return result
    }
    if (step === 2) {
      return await trigger(['city', 'bloodGroup'])
    }
    if (step === 3) {
      const result = await trigger(['emergencyName', 'emergencyRelation'])
      const phoneValidation = validatePhoneByCountry(emergencyPhoneValue, emergencyCountryCode)
      if (!phoneValidation.valid) {
        setEmergencyPhoneError(phoneValidation.error)
        return false
      }
      // Check emergency phone is different from user phone
      const userFullPhone = formatPhoneWithCountryCode(phoneValue, countryCode)
      const emergencyFullPhone = formatPhoneWithCountryCode(emergencyPhoneValue, emergencyCountryCode)
      if (userFullPhone === emergencyFullPhone) {
        setEmergencyPhoneError('Emergency contact must be different from your phone')
        return false
      }
      return result
    }
    return true
  }

  const nextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

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

    // Validate phone
    if (otpChannel === 'phone') {
      const phoneValidation = validatePhoneByCountry(phoneValue, countryCode)
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error)
        toast.error(phoneValidation.error || 'Invalid phone number')
        return
      }
    }

    // Check if user already exists
    const existingByPhone = findUser(fullPhone, 'phone')
    const existingByEmail = findUser(data.email, 'email')
    
    if (existingByPhone || existingByEmail) {
      toast.error('An account with this phone or email already exists. Please login instead.')
      router.push(`/auth/login?role=${role}`)
      return
    }

    // Store pending registration and open OTP modal
    setPendingRegistration({
      ...data,
      name: sanitizeInput(data.name),
      email: sanitizeEmail(data.email),
    })
    setShowOTPModal(true)
  }

  // Handle OTP verification success
  const handleOTPSuccess = () => {
    if (!pendingRegistration) return

    try {
      const fullPhone = formatPhoneWithCountryCode(phoneValue, countryCode)
      const emergencyFullPhone = formatPhoneWithCountryCode(emergencyPhoneValue, emergencyCountryCode)
      const identifier = otpChannel === 'phone' ? fullPhone : pendingRegistration.email

      // Reset rate limit
      resetRateLimit(identifier, 'otp')

      // Create user with all data
      const newUser = createUser({
        phone: fullPhone,
        email: pendingRegistration.email,
        name: pendingRegistration.name,
        dateOfBirth: pendingRegistration.dateOfBirth,
        gender: pendingRegistration.gender,
        bloodGroup: pendingRegistration.bloodGroup || undefined,
        address: {
          city: pendingRegistration.city,
          state: pendingRegistration.state || undefined,
          pincode: pendingRegistration.pincode || undefined,
          country: 'India', // Default, can be made dynamic
        },
        emergencyContact: {
          name: pendingRegistration.emergencyName,
          phone: emergencyFullPhone,
          relation: pendingRegistration.emergencyRelation,
        },
        role,
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
        identifier: otpChannel === 'phone' ? maskPhone(identifier) : maskEmail(identifier),
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
      }, 'session_' + generateSecureToken())

      toast.success(`Welcome to SANGMAN, ${newUser.name}!`, {
        icon: '🎉',
        duration: 4000,
      })

      // Redirect based on role
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
    setRateLimitError(undefined)
    
    if (phone.length > 0) {
      const validation = validatePhoneByCountry(phone, countryCode)
      setPhoneError(validation.error)
      setPhoneValid(validation.valid)
    } else {
      setPhoneError(undefined)
      setPhoneValid(false)
    }
  }

  const handleEmergencyPhoneChange = (phone: string) => {
    setEmergencyPhoneValue(phone)
    
    if (phone.length > 0) {
      const validation = validatePhoneByCountry(phone, emergencyCountryCode)
      setEmergencyPhoneError(validation.error)
    } else {
      setEmergencyPhoneError(undefined)
    }
  }

  // Role configuration
  const roleConfig = role === 'doctor' ? {
    icon: Stethoscope,
    title: 'Join as Doctor',
    subtitle: 'Start your practice on SANGMAN',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 via-white to-teal-50',
    shadowColor: 'shadow-emerald-500/20',
  } : {
    icon: Heart,
    title: 'Create Account',
    subtitle: 'Your health journey starts here',
    gradient: 'from-sky-500 to-cyan-600',
    bgGradient: 'from-sky-50 via-white to-cyan-50',
    shadowColor: 'shadow-sky-500/20',
  }

  const Icon = roleConfig.icon

  // Step progress indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
            step < currentStep 
              ? `bg-gradient-to-r ${roleConfig.gradient} text-white`
              : step === currentStep
                ? `bg-gradient-to-r ${roleConfig.gradient} text-white ring-4 ring-opacity-30 ${role === 'doctor' ? 'ring-emerald-300' : 'ring-sky-300'}`
                : 'bg-gray-100 text-gray-400'
          }`}>
            {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-1 mx-1 rounded-full transition-all duration-300 ${
              step < currentStep ? `bg-gradient-to-r ${roleConfig.gradient}` : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  // Step titles
  const stepTitles = [
    'Personal Details',
    'Location & Health',
    'Emergency Contact',
  ]

  return (
    <div className={`min-h-screen flex bg-gradient-to-br ${roleConfig.bgGradient} transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Left Side - Branding */}
      <div className={`hidden lg:flex lg:w-5/12 bg-gradient-to-br ${roleConfig.gradient} p-12 flex-col justify-between relative overflow-hidden`}>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-16 group">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform heartbeat-container">
              <Heart className="w-8 h-8 text-white heartbeat" fill="white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">SANGMAN</span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {role === 'doctor' ? 'Grow Your Practice' : 'Healthcare at Your Fingertips'}
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-md">
            {role === 'doctor' 
              ? 'Join our network of verified doctors and connect with patients across the globe.'
              : 'Access quality healthcare anytime, anywhere. Book appointments with verified doctors.'}
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Bank-Grade Security</p>
              <p className="text-sm text-white/70">OTP verification for all accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">No Passwords</p>
              <p className="text-sm text-white/70">Secure passwordless authentication</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">100% Verified</p>
              <p className="text-sm text-white/70">All doctors background-checked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-50">
          <SimpleLanguageSwitcher />
        </div>

        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-br ${roleConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
              <Heart className="w-7 h-7 text-white heartbeat" fill="white" />
            </div>
            <span className={`text-2xl font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent`}>
              SANGMAN
            </span>
          </div>

          {/* Form Card */}
          <div className={`bg-white rounded-3xl shadow-2xl ${roleConfig.shadowColor} p-8 border border-gray-100`}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${roleConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{roleConfig.title}</h1>
              <p className="text-gray-500 mt-1">{stepTitles[currentStep - 1]}</p>
            </div>

            {/* Step Indicator */}
            <StepIndicator />

            {/* Rate Limit Warning */}
            {rateLimitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">Too Many Attempts</p>
                  <p className="text-sm text-red-600">{rateLimitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                    onCountryCodeChange={setCountryCode}
                    onPhoneChange={handlePhoneChange}
                    value={phoneValue}
                    error={phoneError}
                  />

                  <DateInput
                    label="Date of Birth"
                    value={watchedValues.dateOfBirth}
                    onChange={(isoDate) => setValue('dateOfBirth', isoDate, { shouldValidate: true })}
                    error={errors.dateOfBirth?.message}
                    maxDate={new Date()}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="flex gap-3">
                      {GENDERS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setValue('gender', g.value as 'male' | 'female' | 'other', { shouldValidate: true })}
                          className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                            watchedValues.gender === g.value
                              ? `border-transparent bg-gradient-to-r ${roleConfig.gradient} text-white`
                              : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span>{g.icon}</span>
                          {g.label}
                        </button>
                      ))}
                    </div>
                    {errors.gender && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.gender.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Location & Health */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Why we need this?</p>
                        <p className="text-sm text-blue-600">Location helps us find nearby doctors. Blood group is useful for emergencies.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City / Town
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Enter your city"
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 text-gray-900 transition-all focus:outline-none focus:ring-4 ${
                          errors.city
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-sky-500 focus:ring-sky-100'
                        }`}
                        {...register('city')}
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all"
                        {...register('state')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PIN Code (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="PIN/ZIP"
                        maxLength={10}
                        className={`w-full px-4 py-3.5 rounded-xl border-2 text-gray-900 transition-all focus:outline-none focus:ring-4 ${
                          errors.pincode
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-sky-500 focus:ring-sky-100'
                        }`}
                        {...register('pincode')}
                      />
                      {errors.pincode && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.pincode.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Blood Group (Optional)
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 focus:outline-none transition-all appearance-none bg-white"
                        {...register('bloodGroup')}
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg.value} value={bg.value}>{bg.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Emergency Contact */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Emergency Contact Required</p>
                        <p className="text-sm text-amber-600">This person will be notified in case of medical emergencies.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Person Name
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Full name of emergency contact"
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 text-gray-900 transition-all focus:outline-none focus:ring-4 ${
                          errors.emergencyName
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-sky-500 focus:ring-sky-100'
                        }`}
                        {...register('emergencyName')}
                      />
                    </div>
                    {errors.emergencyName && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.emergencyName.message}</p>
                    )}
                  </div>

                  <PhoneInput
                    label="Emergency Phone Number"
                    countryCode={emergencyCountryCode}
                    onCountryCodeChange={setEmergencyCountryCode}
                    onPhoneChange={handleEmergencyPhoneChange}
                    value={emergencyPhoneValue}
                    error={emergencyPhoneError}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Relation
                    </label>
                    <div className="relative">
                      <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 text-gray-900 transition-all focus:outline-none focus:ring-4 appearance-none bg-white ${
                          errors.emergencyRelation
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-sky-500 focus:ring-sky-100'
                        }`}
                        {...register('emergencyRelation')}
                      >
                        <option value="">Select relation</option>
                        {RELATIONS.map((rel) => (
                          <option key={rel} value={rel}>{rel}</option>
                        ))}
                      </select>
                    </div>
                    {errors.emergencyRelation && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.emergencyRelation.message}</p>
                    )}
                  </div>

                  {/* OTP Channel Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Verify Account Via
                    </label>
                    <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setOtpChannel('phone')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
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
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
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
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3.5 px-6 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r ${roleConfig.gradient} text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg ${roleConfig.shadowColor}`}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !!rateLimitError}
                    className={`flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r ${roleConfig.gradient} text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${roleConfig.shadowColor}`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create Account
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Remaining Attempts Warning */}
              {remainingAttempts !== undefined && remainingAttempts < 3 && (
                <p className="mt-4 text-sm text-amber-600 flex items-center justify-center gap-1.5 bg-amber-50 p-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4" />
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                </p>
              )}

              {currentStep === totalSteps && (
                <p className="mt-4 text-xs text-center text-gray-500">
                  <Lock className="w-3.5 h-3.5 inline mr-1" />
                  A 6-digit OTP will be sent to your {otpChannel === 'phone' ? 'phone' : 'email'} for verification
                </p>
              )}
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link 
                  href={`/auth/login?role=${role}`} 
                  className={`font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent hover:opacity-80`}
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Role Switch */}
            <div className="mt-6 pt-6 border-t border-gray-100">
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
            <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
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
        email={otpChannel === 'email' ? watchedValues.email : undefined}
        channel={otpChannel === 'phone' ? 'sms' : 'email'}
        purpose="register"
      />
    </div>
  )
}

function RegisterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl heartbeat-container">
          <Heart className="w-10 h-10 text-white heartbeat" fill="white" />
        </div>
        <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading registration...</p>
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

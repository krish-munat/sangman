'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Heart, Mail, Stethoscope, Shield, ArrowRight, ArrowLeft, Sparkles, Smartphone, 
  User, Clock, X, AlertTriangle, CheckCircle, UserPlus, LogIn, Globe, 
  Lock, Eye, EyeOff, Fingerprint, Loader2, Info
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import toast from 'react-hot-toast'
import PhoneInput from '@/components/auth/PhoneInput'
import OTPVerificationModal from '@/components/auth/OTPVerificationModal'
import SimpleLanguageSwitcher from '@/components/SimpleLanguageSwitcher'
import { validatePhoneByCountry, formatPhoneWithCountryCode } from '@/lib/utils/validation'
import { 
  checkRateLimit, 
  resetRateLimit,
  sanitizeEmail, 
  sanitizePhone,
  saveRememberedCredential,
  getRememberedCredentials,
  removeRememberedCredential,
  maskPhone,
  maskEmail,
  recordLoginAttempt,
  generateSecureToken,
  getDeviceFingerprint,
  type RememberedCredential
} from '@/lib/utils/security'

// ================================
// Constants & Types
// ================================

const USERS_DB_KEY = 'sangman_users_db'
const ANIMATION_DURATION = 200

interface StoredUser {
  id: string
  phone?: string
  email?: string
  name: string
  role: 'patient' | 'doctor' | 'admin'
  verified: boolean
  createdAt: string
  lastLogin?: string
}

interface RoleConfig {
  icon: typeof Heart
  title: string
  subtitle: string
  gradient: string
  bgGradient: string
  accentColor: string
  shadowColor: string
}

// ================================
// Database Utilities (Simulated - Replace with API in production)
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
    type === 'phone' ? u.phone === identifier : u.email?.toLowerCase() === identifier.toLowerCase()
  )
}

function updateUserLastLogin(identifier: string, type: 'phone' | 'email'): void {
  const users = getUsersDB()
  const user = users.find(u => 
    type === 'phone' ? u.phone === identifier : u.email?.toLowerCase() === identifier.toLowerCase()
  )
  if (user) {
    user.lastLogin = new Date().toISOString()
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
  }
}

// ================================
// Role Configurations
// ================================

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  doctor: {
    icon: Stethoscope,
    title: 'Doctor Portal',
    subtitle: 'Access your practice dashboard',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 via-white to-teal-50',
    accentColor: 'emerald',
    shadowColor: 'shadow-emerald-500/20',
  },
  admin: {
    icon: Shield,
    title: 'Admin Portal',
    subtitle: 'Platform administration',
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-50 via-white to-purple-50',
    accentColor: 'violet',
    shadowColor: 'shadow-violet-500/20',
  },
  patient: {
    icon: Heart,
    title: 'Patient Portal',
    subtitle: 'Access your health dashboard',
    gradient: 'from-sky-500 to-cyan-600',
    bgGradient: 'from-sky-50 via-white to-cyan-50',
    accentColor: 'sky',
    shadowColor: 'shadow-sky-500/20',
  },
}

// ================================
// Animated Background Component
// ================================

function AnimatedBackground({ gradient }: { gradient: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-95`} />
      
      {/* Animated orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl animate-pulse" 
           style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl animate-pulse"
           style={{ animationDuration: '5s', animationDelay: '1s' }} />
      <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-white/5 rounded-full blur-xl animate-pulse"
           style={{ animationDuration: '6s', animationDelay: '2s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
             backgroundSize: '50px 50px'
           }} />
      
      {/* Healthcare pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="medical-cross" patternUnits="userSpaceOnUse" width="100" height="100">
            <path d="M45 35h10v30h-10zM35 45h30v10h-30z" fill="currentColor" className="text-white"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#medical-cross)" />
      </svg>
    </div>
  )
}

// ================================
// Feature Card Component
// ================================

function FeatureCard({ icon: Icon, title, description }: { 
  icon: typeof Shield
  title: string
  description: string 
}) {
  return (
    <div className="flex items-center gap-4 text-white/90 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all duration-300 group cursor-default">
      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-lg">{title}</p>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
  )
}

// ================================
// Validation Status Component
// ================================

function ValidationStatus({ isValid, message }: { isValid: boolean | null; message?: string }) {
  if (isValid === null) return null
  
  return (
    <div className={`flex items-center gap-2 mt-2 text-sm transition-all duration-200 ${
      isValid ? 'text-emerald-600' : 'text-red-500'
    }`}>
      {isValid ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertTriangle className="w-4 h-4" />
      )}
      <span>{message}</span>
    </div>
  )
}

// ================================
// Security Info Banner
// ================================

function SecurityBanner() {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl mb-6">
      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Lock className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-emerald-800 font-medium">Secure Login</p>
        <p className="text-xs text-emerald-600">256-bit SSL encryption • OTP verification</p>
      </div>
      <Fingerprint className="w-6 h-6 text-emerald-400" />
    </div>
  )
}

// ================================
// Main Login Form Component
// ================================

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'patient'
  
  // Refs
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  
  // Auth state
  const { login, isAuthenticated, isHydrated } = useAuthStore()
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone')

  // Modal states
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [showAccountNotFound, setShowAccountNotFound] = useState(false)
  const [pendingIdentifier, setPendingIdentifier] = useState('')

  // Phone input state
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneValue, setPhoneValue] = useState('')
  const [phoneError, setPhoneError] = useState<string | undefined>()
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null)
  
  // Email state
  const [emailValue, setEmailValue] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()
  const [emailValid, setEmailValid] = useState<boolean | null>(null)

  // Remembered credentials
  const [rememberedCreds, setRememberedCreds] = useState<RememberedCredential[]>([])
  const [selectedRemembered, setSelectedRemembered] = useState<RememberedCredential | null>(null)

  // Rate limiting state
  const [rateLimitError, setRateLimitError] = useState<string | undefined>()
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>()

  // Loading state
  const [isChecking, setIsChecking] = useState(false)
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false)
  
  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Load remembered credentials on mount
  useEffect(() => {
    const creds = getRememberedCredentials()
    setRememberedCreds(creds)
    
    // Auto-select if only one remembered credential
    if (creds.length === 1) {
      selectRememberedCredential(creds[0])
    }
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const userRole = useAuthStore.getState().user?.role
      const redirectPath = userRole === 'patient' ? '/patient' 
                         : userRole === 'doctor' ? '/doctor/dashboard'
                         : userRole === 'admin' ? '/admin/dashboard'
                         : '/'
      router.push(redirectPath)
    }
  }, [isHydrated, isAuthenticated, router])

  // ================================
  // Handlers
  // ================================

  const selectRememberedCredential = useCallback((cred: RememberedCredential) => {
    setSelectedRemembered(cred)
    setOtpChannel(cred.type)
    setShowAccountNotFound(false)
    setRateLimitError(undefined)
    
    if (cred.type === 'phone') {
      setCountryCode(cred.countryCode || '+91')
      const phoneWithoutCode = cred.fullValue.replace(cred.countryCode || '+91', '')
      setPhoneValue(phoneWithoutCode)
      setPhoneValid(true)
      setPhoneError(undefined)
    } else {
      setEmailValue(cred.fullValue)
      setEmailValid(true)
      setEmailError(undefined)
    }
  }, [])

  const handleRemoveRemembered = useCallback((fullValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeRememberedCredential(fullValue)
    setRememberedCreds(prev => prev.filter(c => c.fullValue !== fullValue))
    
    if (selectedRemembered?.fullValue === fullValue) {
      setSelectedRemembered(null)
      setPhoneValue('')
      setEmailValue('')
      setPhoneValid(null)
      setEmailValid(null)
    }
    
    toast.success('Saved credential removed', { icon: '🗑️' })
  }, [selectedRemembered])

  const handlePhoneChange = useCallback((phone: string) => {
    const sanitized = sanitizePhone(phone)
    setPhoneValue(sanitized)
    setSelectedRemembered(null)
    setRateLimitError(undefined)
    setShowAccountNotFound(false)
    
    if (sanitized.length > 0) {
      const validation = validatePhoneByCountry(sanitized, countryCode)
      setPhoneError(validation.error)
      setPhoneValid(validation.valid)
    } else {
      setPhoneError(undefined)
      setPhoneValid(null)
    }
  }, [countryCode])

  const handleCountryCodeChange = useCallback((code: string) => {
    setCountryCode(code)
    setShowAccountNotFound(false)
    if (phoneValue.length > 0) {
      const validation = validatePhoneByCountry(phoneValue, code)
      setPhoneError(validation.error)
      setPhoneValid(validation.valid)
    }
  }, [phoneValue])

  const handleEmailChange = useCallback((email: string) => {
    const sanitized = sanitizeEmail(email)
    setEmailValue(sanitized)
    setSelectedRemembered(null)
    setRateLimitError(undefined)
    setShowAccountNotFound(false)
    
    if (sanitized) {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)
      setEmailError(isValidEmail ? undefined : 'Please enter a valid email address')
      setEmailValid(isValidEmail)
    } else {
      setEmailError(undefined)
      setEmailValid(null)
    }
  }, [])

  const handleChannelChange = useCallback((channel: 'phone' | 'email') => {
    setOtpChannel(channel)
    setShowAccountNotFound(false)
    setRateLimitError(undefined)
    
    // Focus the appropriate input after a brief delay
    setTimeout(() => {
      if (channel === 'phone') {
        phoneInputRef.current?.focus()
      } else {
        emailInputRef.current?.focus()
      }
    }, ANIMATION_DURATION)
  }, [])

  // Check if account exists and send OTP
  const handleLogin = async () => {
    const identifier = otpChannel === 'phone' 
      ? formatPhoneWithCountryCode(phoneValue, countryCode)
      : emailValue

    // Validate input
    if (otpChannel === 'email') {
      if (!emailValue || !emailValid) {
        setEmailError('Please enter a valid email address')
        emailInputRef.current?.focus()
        return
      }
    } else {
      const phoneValidation = validatePhoneByCountry(phoneValue, countryCode)
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error)
        return
      }
    }

    // Check rate limit
    const rateCheck = checkRateLimit(identifier, 'login')
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.message)
      toast.error(rateCheck.message || 'Too many attempts. Please wait.', { icon: '⏳' })
      return
    }
    setRemainingAttempts(rateCheck.remainingAttempts)

    setIsChecking(true)

    // Simulate API call - In production, this would be an actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if user exists
    const existingUser = findUser(identifier, otpChannel)

    if (!existingUser) {
      setPendingIdentifier(identifier)
      setShowAccountNotFound(true)
      setIsChecking(false)
      
      recordLoginAttempt({
        identifier: maskPhone(identifier),
        type: otpChannel,
        success: false,
        method: 'otp',
      })
      return
    }

    // Account exists - proceed with OTP
    setIsChecking(false)
    setShowOTPModal(true)
    toast.success(`OTP sent to your ${otpChannel === 'phone' ? 'phone' : 'email'}`, { icon: '📨' })
  }

  // Handle OTP verification success
  const handleOTPSuccess = useCallback(() => {
    const fullPhone = otpChannel === 'phone' ? formatPhoneWithCountryCode(phoneValue, countryCode) : ''
    const identifier = otpChannel === 'phone' ? fullPhone : emailValue

    // Reset rate limits on successful login
    resetRateLimit(identifier, 'otp')
    resetRateLimit(identifier, 'login')

    // Get user from database
    const user = findUser(identifier, otpChannel)
    
    if (!user) {
      toast.error('Account not found. Please sign up first.')
      return
    }

    // Update last login timestamp
    updateUserLastLogin(identifier, otpChannel)

    // Save remembered credential for quick login next time
    saveRememberedCredential({
      identifier: otpChannel === 'phone' ? maskPhone(fullPhone) : maskEmail(emailValue),
      type: otpChannel,
      fullValue: identifier,
      countryCode: otpChannel === 'phone' ? countryCode : undefined,
      userName: user.name,
    })

    // Record successful login attempt
    recordLoginAttempt({
      identifier: otpChannel === 'phone' ? maskPhone(identifier) : maskEmail(identifier),
      type: otpChannel,
      success: true,
      method: 'otp',
    })

    // Perform login
    const sessionToken = `session_${Date.now()}_${generateSecureToken()}`
    login({
      id: user.id,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: new Date().toISOString(),
    }, sessionToken)

    toast.success(`Welcome back, ${user.name}!`, { 
      icon: '👋',
      duration: 3000,
    })

    // Redirect based on role
    setTimeout(() => {
      const redirectPath = user.role === 'patient' ? '/patient' 
                         : user.role === 'doctor' ? '/doctor/dashboard'
                         : '/admin/dashboard'
      router.push(redirectPath)
    }, 500)
  }, [otpChannel, phoneValue, countryCode, emailValue, login, router])

  const handleGoToSignup = useCallback(() => {
    const params = new URLSearchParams()
    params.set('role', role)
    if (otpChannel === 'phone') {
      params.set('phone', phoneValue)
      params.set('countryCode', countryCode)
    } else {
      params.set('email', emailValue)
    }
    router.push(`/auth/register?${params.toString()}`)
  }, [role, otpChannel, phoneValue, countryCode, emailValue, router])

  const clearSelection = useCallback(() => {
    setSelectedRemembered(null)
    setPhoneValue('')
    setEmailValue('')
    setPhoneValid(null)
    setEmailValid(null)
    setShowAccountNotFound(false)
    setRateLimitError(undefined)
  }, [])

  // Get role configuration
  const roleConfig = ROLE_CONFIGS[role] || ROLE_CONFIGS.patient
  const Icon = roleConfig.icon

  // Determine if form is valid
  const isFormValid = otpChannel === 'phone' 
    ? phoneValue && phoneValid && !phoneError
    : emailValue && emailValid && !emailError

  return (
    <div className={`min-h-screen flex bg-gradient-to-br ${roleConfig.bgGradient} transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AnimatedBackground gradient={roleConfig.gradient} />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo and Brand */}
          <div>
            <Link 
              href="/" 
              className="flex items-center gap-4 mb-16 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-2xl p-2 -m-2"
              aria-label="Go to SANGMAN homepage"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300 heartbeat-container">
                <Heart className="w-9 h-9 text-white heartbeat" fill="white" />
              </div>
              <span className="text-4xl font-bold text-white tracking-tight">SANGMAN</span>
            </Link>

            <div className="space-y-6 max-w-lg">
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight">
                Welcome Back to<br />
                <span className="text-white/90">Better Healthcare</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Your health journey continues here. Secure, simple, and always available when you need it most.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <FeatureCard 
              icon={Shield}
              title="Bank-Grade Security"
              description="OTP verification for every login attempt"
            />
            <FeatureCard 
              icon={Sparkles}
              title="Quick Access"
              description="Saved credentials for faster login"
            />
            <FeatureCard 
              icon={CheckCircle}
              title="100% Verified Doctors"
              description="All healthcare providers are background-checked"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 lg:top-8 lg:right-8 z-50">
          <SimpleLanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Link href="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl p-2 -m-2">
              <div className={`w-14 h-14 bg-gradient-to-br ${roleConfig.gradient} rounded-2xl flex items-center justify-center shadow-xl ${roleConfig.shadowColor}`}>
                <Heart className="w-8 h-8 text-white heartbeat" fill="white" />
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent`}>
                SANGMAN
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div 
            className={`bg-white rounded-3xl shadow-2xl shadow-gray-200/60 p-8 lg:p-10 border border-gray-100 transform transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            role="main"
            aria-labelledby="login-title"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div 
                className={`w-18 h-18 bg-gradient-to-br ${roleConfig.gradient} rounded-2xl flex items-center justify-center shadow-xl ${roleConfig.shadowColor} mx-auto mb-5 w-[72px] h-[72px]`}
                aria-hidden="true"
              >
                <Icon className="w-9 h-9 text-white" />
              </div>
              <h1 id="login-title" className="text-2xl font-bold text-gray-900">{roleConfig.title}</h1>
              <p className="text-gray-500 mt-1.5">{roleConfig.subtitle}</p>
            </div>

            {/* Security Banner */}
            <SecurityBanner />

            {/* Account Not Found Alert */}
            {showAccountNotFound && (
              <div 
                className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 mb-1">Account Not Found</h3>
                    <p className="text-sm text-amber-700 mb-4">
                      No account exists with this {otpChannel === 'phone' ? 'phone number' : 'email address'}. 
                      Would you like to create one?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleGoToSignup}
                        className={`flex-1 py-2.5 px-4 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500`}
                      >
                        <UserPlus className="w-4 h-4" />
                        Create Account
                      </button>
                      <button
                        onClick={() => setShowAccountNotFound(false)}
                        className="py-2.5 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rate Limit Warning */}
            {rateLimitError && (
              <div 
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
                role="alert"
                aria-live="assertive"
              >
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-red-700">Too Many Attempts</p>
                  <p className="text-sm text-red-600">{rateLimitError}</p>
                </div>
              </div>
            )}

            {/* Remembered Credentials */}
            {rememberedCreds.length > 0 && !selectedRemembered && !showAccountNotFound && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Quick login with saved account
                </p>
                <div className="space-y-2" role="list" aria-label="Saved accounts">
                  {rememberedCreds.map((cred, idx) => (
                    <button
                      key={`${cred.fullValue}-${idx}`}
                      onClick={() => selectRememberedCredential(cred)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                      role="listitem"
                      aria-label={`Login as ${cred.userName || 'User'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                        cred.type === 'phone' ? 'bg-sky-100' : 'bg-purple-100'
                      }`}>
                        {cred.type === 'phone' ? (
                          <Smartphone className="w-6 h-6 text-sky-600" />
                        ) : (
                          <Mail className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">{cred.userName || 'User'}</p>
                        <p className="text-sm text-gray-500">{cred.identifier}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-200" />
                      <button
                        onClick={(e) => handleRemoveRemembered(cred.fullValue, e)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-400"
                        title="Remove saved account"
                        aria-label={`Remove ${cred.userName || 'User'} from saved accounts`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </button>
                  ))}
                </div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm text-gray-500">or login with different account</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Remembered Credential */}
            {selectedRemembered && !showAccountNotFound && (
              <div className="mb-6 p-5 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl border border-sky-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-sky-700">Logging in as</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium focus:outline-none focus-visible:underline"
                  >
                    Change account
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <User className="w-7 h-7 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{selectedRemembered.userName || 'User'}</p>
                    <p className="text-gray-600">{selectedRemembered.identifier}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form - Only show if no remembered credential selected and no account-not-found */}
            {!selectedRemembered && !showAccountNotFound && (
              <div className="space-y-5">
                {/* OTP Channel Toggle */}
                <div 
                  className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl"
                  role="tablist"
                  aria-label="Login method"
                >
                  <button
                    type="button"
                    onClick={() => handleChannelChange('phone')}
                    className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      otpChannel === 'phone'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    role="tab"
                    aria-selected={otpChannel === 'phone'}
                    aria-controls="phone-panel"
                    id="phone-tab"
                  >
                    <Smartphone className="w-4 h-4" />
                    Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChannelChange('email')}
                    className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      otpChannel === 'email'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    role="tab"
                    aria-selected={otpChannel === 'email'}
                    aria-controls="email-panel"
                    id="email-tab"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </div>

                {/* Phone Input Panel */}
                <div 
                  id="phone-panel"
                  role="tabpanel"
                  aria-labelledby="phone-tab"
                  hidden={otpChannel !== 'phone'}
                  className={`transition-all duration-200 ${otpChannel === 'phone' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
                >
                  <PhoneInput
                    label="Phone Number"
                    countryCode={countryCode}
                    onCountryCodeChange={handleCountryCodeChange}
                    onPhoneChange={handlePhoneChange}
                    value={phoneValue}
                    error={phoneError}
                    ref={phoneInputRef}
                  />
                  {phoneValid && (
                    <ValidationStatus isValid={true} message="Valid phone number" />
                  )}
                </div>

                {/* Email Input Panel */}
                <div 
                  id="email-panel"
                  role="tabpanel"
                  aria-labelledby="email-tab"
                  hidden={otpChannel !== 'email'}
                  className={`transition-all duration-200 ${otpChannel === 'email' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
                >
                  <div>
                    <label htmlFor="email-input" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        ref={emailInputRef}
                        id="email-input"
                        type="email"
                        value={emailValue}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        placeholder="Enter your email address"
                        autoComplete="email"
                        aria-invalid={emailError ? 'true' : 'false'}
                        aria-describedby={emailError ? 'email-error' : undefined}
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 text-gray-900 transition-all duration-200 focus:outline-none ${
                          emailError 
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                            : emailValid
                              ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                              : 'border-gray-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'
                        }`}
                      />
                      {emailValid && (
                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    {emailError && (
                      <p id="email-error" className="mt-2 text-sm text-red-500 flex items-center gap-1.5" role="alert">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {emailError}
                      </p>
                    )}
                    {emailValid && (
                      <ValidationStatus isValid={true} message="Valid email address" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Attempts Warning */}
            {remainingAttempts !== undefined && remainingAttempts < 3 && !showAccountNotFound && (
              <div 
                className="mt-4 text-sm text-amber-700 flex items-center gap-2.5 bg-amber-50 p-3.5 rounded-xl border border-amber-200"
                role="alert"
              >
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>
                  <strong>{remainingAttempts}</strong> attempt{remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout
                </span>
              </div>
            )}

            {/* Login Button */}
            {!showAccountNotFound && (
              <button
                type="button"
                onClick={handleLogin}
                disabled={
                  isChecking ||
                  !!rateLimitError ||
                  !isFormValid
                }
                aria-busy={isChecking}
                className={`w-full mt-6 rounded-xl bg-gradient-to-r ${roleConfig.gradient} py-4 text-base font-bold text-white hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-3 shadow-lg ${roleConfig.shadowColor} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500`}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying account...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>{selectedRemembered ? 'Continue with OTP' : 'Login with OTP'}</span>
                  </>
                )}
              </button>
            )}

            {!showAccountNotFound && (
              <p className="mt-4 text-xs text-center text-gray-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                A 6-digit OTP will be sent to your {otpChannel === 'phone' ? 'phone' : 'email'} for secure verification
              </p>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600">
                New to Sangman?{' '}
                <Link 
                  href={`/auth/register?role=${role}`} 
                  className={`font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity focus:outline-none focus-visible:underline`}
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Role Switch */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-center text-gray-500 mb-4">Switch portal:</p>
              <div className="flex gap-2" role="group" aria-label="Switch user portal">
                {[
                  { role: 'patient', label: 'Patient', icon: Heart, gradient: 'from-sky-500 to-cyan-600' },
                  { role: 'doctor', label: 'Doctor', icon: Stethoscope, gradient: 'from-emerald-500 to-teal-600' },
                  { role: 'admin', label: 'Admin', icon: Shield, gradient: 'from-violet-500 to-purple-600' },
                ].map((r) => {
                  const RoleIcon = r.icon
                  const isActive = role === r.role
                  return (
                    <Link
                      key={r.role}
                      href={`/auth/login?role=${r.role}`}
                      className={`flex-1 text-center py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        isActive
                          ? `bg-gradient-to-r ${r.gradient} text-white shadow-md`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <RoleIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{r.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-2 focus:outline-none focus-visible:underline group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Protected by 256-bit SSL encryption
            </p>
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
        purpose="login"
      />
    </div>
  )
}

// ================================
// Loading State Component
// ================================

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-sky-500/30 heartbeat-container">
          <Heart className="w-12 h-12 text-white heartbeat" fill="white" />
        </div>
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium text-lg">Loading secure login...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we prepare everything</p>
      </div>
    </div>
  )
}

// ================================
// Main Export
// ================================

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}

'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Heart, Mail, Stethoscope, Shield, ArrowRight, Sparkles, Smartphone, User, Clock, X, AlertTriangle, CheckCircle } from 'lucide-react'
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
  type RememberedCredential
} from '@/lib/utils/security'

// User database simulation (in production, this would be API calls)
interface StoredUser {
  id: string
  phone?: string
  email?: string
  name: string
  role: 'patient' | 'doctor' | 'admin'
  verified: boolean
  createdAt: string
}

// Simulated user database stored in localStorage
const USERS_DB_KEY = 'sangman_users_db'

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

function createOrUpdateUser(data: Partial<StoredUser> & { phone?: string; email?: string }): StoredUser {
  const users = getUsersDB()
  const identifier = data.phone || data.email || ''
  const type = data.phone ? 'phone' : 'email'
  
  let existingUser = users.find(u => 
    type === 'phone' ? u.phone === identifier : u.email === identifier
  )
  
  if (existingUser) {
    // Update existing user
    Object.assign(existingUser, data, { verified: true })
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
    return existingUser
  }
  
  // Create new user
  const newUser: StoredUser = {
    id: 'user_' + generateSecureToken().substring(0, 16),
    phone: data.phone,
    email: data.email,
    name: data.name || 'User',
    role: data.role || 'patient',
    verified: true,
    createdAt: new Date().toISOString(),
  }
  
  users.push(newUser)
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users))
  return newUser
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'patient'
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone')
  const { login, isAuthenticated, isHydrated } = useAuthStore()

  // OTP Modal state
  const [showOTPModal, setShowOTPModal] = useState(false)

  // Phone input state
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneValue, setPhoneValue] = useState('')
  const [phoneError, setPhoneError] = useState<string | undefined>()
  
  // Email state
  const [emailValue, setEmailValue] = useState('')
  const [emailError, setEmailError] = useState<string | undefined>()

  // Remembered credentials
  const [rememberedCreds, setRememberedCreds] = useState<RememberedCredential[]>([])
  const [showRememberedList, setShowRememberedList] = useState(false)
  const [selectedRemembered, setSelectedRemembered] = useState<RememberedCredential | null>(null)

  // Rate limiting state
  const [rateLimitError, setRateLimitError] = useState<string | undefined>()
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>()

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
      if (userRole === 'patient') router.push('/patient')
      else if (userRole === 'doctor') router.push('/doctor/dashboard')
      else if (userRole === 'admin') router.push('/admin/dashboard')
    }
  }, [isHydrated, isAuthenticated, router])

  const selectRememberedCredential = (cred: RememberedCredential) => {
    setSelectedRemembered(cred)
    setOtpChannel(cred.type)
    
    if (cred.type === 'phone') {
      setCountryCode(cred.countryCode || '+91')
      // Extract phone without country code
      const phoneWithoutCode = cred.fullValue.replace(cred.countryCode || '+91', '')
      setPhoneValue(phoneWithoutCode)
    } else {
      setEmailValue(cred.fullValue)
    }
    
    setShowRememberedList(false)
  }

  const handleRemoveRemembered = (fullValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeRememberedCredential(fullValue)
    setRememberedCreds(prev => prev.filter(c => c.fullValue !== fullValue))
    
    if (selectedRemembered?.fullValue === fullValue) {
      setSelectedRemembered(null)
      setPhoneValue('')
      setEmailValue('')
    }
    
    toast.success('Removed saved credential')
  }

  const handlePhoneChange = (phone: string) => {
    setPhoneValue(sanitizePhone(phone))
    setSelectedRemembered(null)
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

  const handleEmailChange = (email: string) => {
    setEmailValue(sanitizeEmail(email))
    setSelectedRemembered(null)
    setRateLimitError(undefined)
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError(undefined)
    }
  }

  // Validate and send OTP
  const handleSendOTP = () => {
    const identifier = otpChannel === 'phone' 
      ? formatPhoneWithCountryCode(phoneValue, countryCode)
      : emailValue

    // Check rate limit
    const rateCheck = checkRateLimit(identifier, 'otp')
    if (!rateCheck.allowed) {
      setRateLimitError(rateCheck.message)
      toast.error(rateCheck.message || 'Too many attempts')
      return
    }
    setRemainingAttempts(rateCheck.remainingAttempts)

    if (otpChannel === 'email') {
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        setEmailError('Please enter a valid email address')
        toast.error('Please enter a valid email address')
        return
      }
    } else {
      const phoneValidation = validatePhoneByCountry(phoneValue, countryCode)
      if (!phoneValidation.valid) {
        setPhoneError(phoneValidation.error)
        toast.error(phoneValidation.error || 'Please enter a valid phone number')
        return
      }
    }

    // Record attempt
    recordLoginAttempt({
      identifier,
      type: otpChannel,
      success: false, // Will be updated on success
      method: 'otp',
    })

    setShowOTPModal(true)
  }

  // Handle OTP verification success
  const handleOTPSuccess = () => {
    const fullPhone = otpChannel === 'phone' ? formatPhoneWithCountryCode(phoneValue, countryCode) : ''
    const identifier = otpChannel === 'phone' ? fullPhone : emailValue

    // Reset rate limit on success
    resetRateLimit(identifier, 'otp')
    resetRateLimit(identifier, 'login')

    // Find or create user
    const existingUser = findUser(identifier, otpChannel)
    const isNewUser = !existingUser
    
    const user = createOrUpdateUser({
      phone: otpChannel === 'phone' ? fullPhone : undefined,
      email: otpChannel === 'email' ? emailValue : undefined,
      role: role as 'patient' | 'doctor' | 'admin',
      name: existingUser?.name || (role === 'doctor' ? 'Doctor' : role === 'admin' ? 'Admin' : 'User'),
    })

    // Save remembered credential
    saveRememberedCredential({
      identifier: otpChannel === 'phone' ? maskPhone(fullPhone) : maskEmail(emailValue),
      type: otpChannel,
      fullValue: identifier,
      countryCode: otpChannel === 'phone' ? countryCode : undefined,
      userName: user.name,
    })

    // Record successful login
    recordLoginAttempt({
      identifier,
      type: otpChannel,
      success: true,
      method: 'otp',
    })

    // Login
    login({
      id: user.id,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: new Date().toISOString(),
    }, 'token_' + generateSecureToken())

    // Show appropriate message
    if (isNewUser) {
      toast.success(`Welcome, ${user.name}! Your account has been created.`)
    } else {
      toast.success(`Welcome back, ${user.name}!`)
    }

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
          subtitle: 'Secure OTP login for verified doctors',
          gradient: 'from-emerald-500 to-teal-600',
          bgGradient: 'from-emerald-50 to-teal-50',
        }
      case 'admin':
        return {
          icon: Shield,
          title: 'Admin Portal',
          subtitle: 'Secure administrative access',
          gradient: 'from-purple-500 to-indigo-600',
          bgGradient: 'from-purple-50 to-indigo-50',
        }
      default:
        return {
          icon: Heart,
          title: 'Secure Login',
          subtitle: 'Verify with OTP for your security',
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
              <Heart className="w-7 h-7 text-white heartbeat" fill="white" />
            </div>
            <span className="text-3xl font-bold text-white">SANGMAN</span>
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Secure Healthcare<br />Access
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-md">
            Your health data is protected with OTP verification. No passwords to remember or steal.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <span>OTP-Based Secure Login</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Rate-Limited Protection</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span>Device Recognition</span>
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
              <span className="text-sm text-green-700 font-medium">OTP Verification Required</span>
            </div>

            {/* Remembered Credentials */}
            {rememberedCreds.length > 0 && !selectedRemembered && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Quick login with saved credentials
                </p>
                <div className="space-y-2">
                  {rememberedCreds.map((cred, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectRememberedCredential(cred)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        cred.type === 'phone' ? 'bg-sky-100' : 'bg-purple-100'
                      }`}>
                        {cred.type === 'phone' ? (
                          <Smartphone className="w-5 h-5 text-sky-600" />
                        ) : (
                          <Mail className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{cred.userName || 'User'}</p>
                        <p className="text-sm text-gray-500">{cred.identifier}</p>
                      </div>
                      <button
                        onClick={(e) => handleRemoveRemembered(cred.fullValue, e)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove saved credential"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </button>
                  ))}
                </div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">or login with new number/email</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Remembered Credential */}
            {selectedRemembered && (
              <div className="mb-6 p-4 bg-sky-50 rounded-xl border border-sky-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-sky-700">Logging in as</span>
                  <button
                    onClick={() => {
                      setSelectedRemembered(null)
                      setPhoneValue('')
                      setEmailValue('')
                    }}
                    className="text-sm text-sky-600 hover:text-sky-700"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedRemembered.type === 'phone' ? 'bg-sky-200' : 'bg-purple-200'
                  }`}>
                    <User className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedRemembered.userName || 'User'}</p>
                    <p className="text-sm text-gray-600">{selectedRemembered.identifier}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rate Limit Warning */}
            {rateLimitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">Account Temporarily Locked</p>
                  <p className="text-sm text-red-600">{rateLimitError}</p>
                </div>
              </div>
            )}

            {/* OTP Login Form */}
            {!selectedRemembered && (
              <div className="space-y-5">
                {/* OTP Channel Toggle */}
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

                {otpChannel === 'phone' ? (
                  <PhoneInput
                    label="Phone Number"
                    countryCode={countryCode}
                    onCountryCodeChange={handleCountryCodeChange}
                    onPhoneChange={handlePhoneChange}
                    value={phoneValue}
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
                        value={emailValue}
                        onChange={(e) => handleEmailChange(e.target.value)}
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
              </div>
            )}

            {/* Remaining Attempts Warning */}
            {remainingAttempts !== undefined && remainingAttempts < 3 && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {remainingAttempts} OTP request{remainingAttempts !== 1 ? 's' : ''} remaining
              </p>
            )}

            {/* Send OTP Button */}
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={
                rateLimitError !== undefined ||
                (otpChannel === 'phone' ? !phoneValue || !!phoneError : !emailValue || !!emailError)
              }
              className={`w-full mt-6 rounded-xl bg-gradient-to-r ${roleConfig.gradient} py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
            >
              <Shield className="w-4 h-4" />
              {selectedRemembered ? 'Verify with OTP' : 'Send OTP & Login'}
            </button>

            <p className="mt-4 text-xs text-center text-gray-500">
              We'll send a 6-digit verification code to your {otpChannel === 'phone' ? 'phone' : 'email'}.
              <br />
              <span className="text-gray-400">Standard messaging rates may apply.</span>
            </p>

            <div className="mt-6 text-center">
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
        email={otpChannel === 'email' ? emailValue : undefined}
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
        <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white heartbeat" />
        </div>
        <p className="text-gray-500">Loading secure login...</p>
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

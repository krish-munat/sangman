'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, Lock, Phone, Stethoscope, Shield, ArrowRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import toast from 'react-hot-toast'
import AuthInput from '@/components/auth/AuthInput'

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
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, isHydrated } = useAuthStore()

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const mockUser = {
        id: 'user-' + Date.now(),
        email: data.email || data.phone || 'user@test.com',
        phone: data.phone || '+919876543210',
        role: role as 'patient' | 'doctor' | 'admin',
        name: role === 'doctor' ? 'Dr. Test User' : role === 'admin' ? 'Admin User' : 'Test Patient',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      login(mockUser, 'mock-token-' + Date.now())
      toast.success('Login successful!')

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

  const handleSendOTP = async () => {
    toast.success('OTP sent to your phone!')
    setOtpSent(true)
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
            <span>Fast Customer Support</span>
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

            {/* Login Method Toggle */}
            <div className="flex gap-2 mb-8 p-1.5 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setLoginMethod('password'); setOtpSent(false) }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  loginMethod === 'password'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('otp'); setOtpSent(false) }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  loginMethod === 'otp'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                OTP Login
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {loginMethod === 'password' ? (
                <>
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
                </>
              ) : (
                <>
                  <AuthInput
                    label="Phone Number"
                    type="tel"
                    icon={Phone}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />

                  {otpSent ? (
                    <AuthInput
                      label="Enter 6-digit OTP"
                      type="text"
                      maxLength={6}
                      error={errors.otp?.message}
                      {...register('otp')}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="w-full rounded-xl border-2 border-sky-500 text-sky-600 py-3.5 text-sm font-semibold hover:bg-sky-50 transition-colors"
                    >
                      Send OTP
                    </button>
                  )}
                </>
              )}

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

            <div className="mt-8 text-center space-y-3">
              <Link href="/auth/forgot-password" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                Forgot Password?
              </Link>
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
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

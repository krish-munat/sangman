'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Mail, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthInput from '@/components/auth/AuthInput'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

const resetPasswordSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
type ResetPasswordData = z.infer<typeof resetPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email')
  const [email, setEmail] = useState('')

  const emailForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const resetForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const handleSendOTP = async (data: ForgotPasswordData) => {
    try {
      // TODO: Replace with actual API call
      setEmail(data.email)
      toast.success('OTP sent to your email!')
      setStep('reset')
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    }
  }

  const handleResetPassword = async (data: ResetPasswordData) => {
    try {
      // TODO: Replace with actual API call
      toast.success('Password reset successfully!')
      setStep('success')
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-800 p-8 shadow-lg">
        
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-8 h-8 text-primary-500" />
          <span className="text-2xl font-bold text-gray-800 dark:text-neutral-100">SANGMAN</span>
        </div>

        {step === 'email' && (
          <>
            <h1 className="text-center text-xl font-semibold text-gray-800 dark:text-neutral-100 mb-1">
              Forgot Password?
            </h1>
            <p className="text-center text-sm text-gray-500 dark:text-neutral-400 mb-6">
              Enter your email and we'll send you an OTP to reset your password.
            </p>

            <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
              <AuthInput
                label="Email"
                type="email"
                icon={Mail}
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register('email')}
              />

              <button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {emailForm.formState.isSubmitting ? 'Sending...' : 'Send OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <h1 className="text-center text-xl font-semibold text-gray-800 dark:text-neutral-100 mb-1">
              Reset Password
            </h1>
            <p className="text-center text-sm text-gray-500 dark:text-neutral-400 mb-6">
              Enter the OTP sent to {email} and your new password.
            </p>

            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <AuthInput
                label="OTP"
                type="text"
                maxLength={6}
                error={resetForm.formState.errors.otp?.message}
                {...resetForm.register('otp')}
              />

              <AuthInput
                label="New Password"
                type="password"
                error={resetForm.formState.errors.password?.message}
                {...resetForm.register('password')}
              />

              <AuthInput
                label="Confirm New Password"
                type="password"
                error={resetForm.formState.errors.confirmPassword?.message}
                {...resetForm.register('confirmPassword')}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-neutral-600 py-3 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={resetForm.formState.isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {resetForm.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>

            <button
              onClick={() => {
                toast.success('OTP resent!')
              }}
              className="w-full mt-4 text-sm text-primary-500 hover:text-primary-600"
            >
              Resend OTP
            </button>
          </>
        )}

        {step === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-neutral-100 mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
              Your password has been reset. You can now login with your new password.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
            >
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {step !== 'success' && (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-neutral-400">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}


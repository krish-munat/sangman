'use client'

import { useState, useEffect } from 'react'
import { Check, Crown, Calendar } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import toast from 'react-hot-toast'

interface SubscriptionPlan {
  id: string
  name: string
  duration: 'monthly' | 'yearly'
  price: number
  discount: number
  features: string[]
}

export default function SubscriptionPage() {
  const { user, updateUser } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const patient = user as any

  const plans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      duration: 'monthly',
      price: 299,
      discount: 10,
      features: [
        '10% discount on all appointments',
        'Priority customer support',
        'Free health tips access',
        'Cancel anytime',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      duration: 'yearly',
      price: 2999,
      discount: 10,
      features: [
        '10% discount on all appointments',
        'Priority customer support',
        'Free health tips access',
        'Save 16% compared to monthly',
        'Cancel anytime',
      ],
    },
  ]

  const handleSubscribe = async (planId: string) => {
    try {
      const plan = plans.find((p) => p.id === planId)
      if (!plan) return

      // TODO: Process payment and create subscription via API
      const subscription = {
        id: 'sub-' + Date.now(),
        patientId: user?.id || '',
        plan: plan.duration,
        startDate: new Date().toISOString(),
        endDate: new Date(
          Date.now() + (plan.duration === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: 'active' as const,
        discount: plan.discount,
      }

      updateUser({ subscription })
      toast.success('Subscription activated successfully!')
      setSelectedPlan(null)
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to activate subscription'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Subscription Plans
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Get 10% discount on every appointment with our subscription plans
        </p>

        {/* Current Subscription */}
        {patient?.subscription?.status === 'active' && (
          <div className="card mb-8 bg-success-50 dark:bg-success-900 border-success-200 dark:border-success-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-success-500" />
                  <h3 className="text-lg font-semibold text-success-700 dark:text-success-300">
                    Active Subscription
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {patient.subscription.plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Valid until {formatDate(patient.subscription.endDate, 'PPP')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success-600">
                  {patient.subscription.discount}% OFF
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">on all appointments</p>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative ${
                plan.duration === 'yearly'
                  ? 'border-2 border-primary-500 ring-2 ring-primary-200'
                  : ''
              }`}
            >
              {plan.duration === 'yearly' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Best Value
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary-500">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400 ml-2">
                    /{plan.duration === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {plan.duration === 'yearly' && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Save {formatCurrency(plan.price * 12 - plan.price)} per year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPlan(plan.id)
                  handleSubscribe(plan.id)
                }}
                className={`w-full ${
                  plan.duration === 'yearly' ? 'btn-primary' : 'btn-outline'
                }`}
                disabled={patient?.subscription?.status === 'active'}
              >
                {patient?.subscription?.status === 'active'
                  ? 'Currently Active'
                  : `Subscribe Now`}
              </button>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="card mt-8">
          <h3 className="text-xl font-semibold mb-4">Subscription Benefits</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-primary-500" />
              </div>
              <h4 className="font-semibold mb-2">Automatic Discount</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                10% discount automatically applied to all appointments
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-success-500" />
              </div>
              <h4 className="font-semibold mb-2">Priority Support</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Get faster response times from our support team
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-3">
                <Crown className="w-6 h-6 text-primary-500" />
              </div>
              <h4 className="font-semibold mb-2">Exclusive Access</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Access to premium health content and tips
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


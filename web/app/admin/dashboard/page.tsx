'use client'

import { useState, useEffect } from 'react'
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import type { Analytics } from '../../../../shared/types'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPatients: 0,
    totalDoctors: 0,
    activeDoctors: 0,
    totalAppointments: 0,
    emergencyAppointments: 0,
    revenue: {
      total: 0,
      platformFee: 0,
      byRegion: {},
    },
    regionWiseUsage: {},
  })

  useEffect(() => {
    // Mock data - works without backend
    setAnalytics({
      totalPatients: 10000,
      totalDoctors: 500,
      activeDoctors: 350,
      totalAppointments: 50000,
      emergencyAppointments: 5000,
      revenue: {
        total: 25000000,
        platformFee: 1750000,
        byRegion: {
          'Delhi': 5000000,
          'Mumbai': 4500000,
          'Bangalore': 4000000,
        },
      },
      regionWiseUsage: {
        'Delhi': 15000,
        'Mumbai': 12000,
        'Bangalore': 10000,
      },
    })
  }, [])

  const stats = [
    {
      title: 'Total Patients',
      value: analytics.totalPatients.toLocaleString(),
      icon: Users,
      color: 'primary',
      change: '+12% this month',
    },
    {
      title: 'Total Doctors',
      value: analytics.totalDoctors,
      icon: UserCheck,
      color: 'success',
      change: '+8 this month',
    },
    {
      title: 'Active Doctors',
      value: analytics.activeDoctors,
      icon: UserCheck,
      color: 'primary',
      change: `${((analytics.activeDoctors / analytics.totalDoctors) * 100).toFixed(1)}% active`,
    },
    {
      title: 'Total Appointments',
      value: analytics.totalAppointments.toLocaleString(),
      icon: Calendar,
      color: 'primary',
      change: '+15% this month',
    },
    {
      title: 'Emergency Appointments',
      value: analytics.emergencyAppointments.toLocaleString(),
      icon: AlertCircle,
      color: 'emergency',
      change: `${((analytics.emergencyAppointments / analytics.totalAppointments) * 100).toFixed(1)}% of total`,
    },
    {
      title: 'Platform Revenue',
      value: formatCurrency(analytics.revenue.platformFee),
      icon: DollarSign,
      color: 'success',
      change: '+20% this month',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stat.color === 'primary'
                        ? 'bg-primary-100 dark:bg-primary-900'
                        : stat.color === 'success'
                        ? 'bg-success-100 dark:bg-success-900'
                        : 'bg-emergency-100 dark:bg-emergency-900'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        stat.color === 'primary'
                          ? 'text-primary-500'
                          : stat.color === 'success'
                          ? 'text-success-500'
                          : 'text-emergency-500'
                      }`}
                    />
                  </div>
                </div>
                <h3 className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-success-600">{stat.change}</p>
              </div>
            )
          })}
        </div>

        {/* Revenue by Region */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Revenue by Region
            </h2>
            <div className="space-y-4">
              {Object.entries(analytics.revenue.byRegion).map(([region, revenue]) => (
                <div key={region}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-700 dark:text-neutral-300">{region}</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (revenue / analytics.revenue.total) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Usage by Region
            </h2>
            <div className="space-y-4">
              {Object.entries(analytics.regionWiseUsage).map(([region, usage]) => (
                <div key={region}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-700 dark:text-neutral-300">{region}</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {usage.toLocaleString()} appointments
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-success-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (usage / analytics.totalAppointments) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

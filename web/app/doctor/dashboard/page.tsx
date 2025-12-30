'use client'

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import type { Appointment } from '../../../../shared/types'

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    monthlyEarnings: 0,
    totalPatients: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    // Mock data - works without backend
    setStats({
      todayAppointments: 5,
      pendingAppointments: 3,
      monthlyEarnings: 45000,
      totalPatients: 120,
    })
    setTodayAppointments([])
  }, [])

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'primary',
      change: '+2 from yesterday',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingAppointments,
      icon: Clock,
      color: 'emergency',
      change: 'Requires attention',
    },
    {
      title: 'Monthly Earnings',
      value: formatCurrency(stats.monthlyEarnings),
      icon: DollarSign,
      color: 'success',
      change: '+15% from last month',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'primary',
      change: '+8 this month',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Welcome back, {(user as any)?.name || 'Doctor'}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
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
                <p className="text-xs text-neutral-500 dark:text-neutral-500">{stat.change}</p>
              </div>
            )
          })}
        </div>

        {/* Today's Appointments */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Today's Appointments
              </h2>
              <a
                href="/doctor/appointments"
                className="text-primary-500 hover:text-primary-600 text-sm font-medium"
              >
                View All
              </a>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  No appointments scheduled for today
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {appointment.patient?.name || 'Patient'}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {appointment.timeSlot.start} - {appointment.timeSlot.end}
                        </p>
                      </div>
                      {appointment.type === 'emergency' && (
                        <span className="px-2 py-1 bg-emergency-100 text-emergency-700 text-xs rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Emergency
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/doctor/appointments"
                className="block p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">Manage Appointments</span>
                </div>
              </a>
              <a
                href="/doctor/earnings"
                className="block p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-success-500" />
                  <span className="font-medium">View Earnings</span>
                </div>
              </a>
              <a
                href="/doctor/profile"
                className="block p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">Update Profile</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Search, AlertCircle, TrendingUp, Clock } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { formatDate } from '@/lib/utils/format'
import type { Appointment } from '../../../shared/types'

export default function PatientHomePage() {
  const { user } = useAuthStore()
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  })

  useEffect(() => {
    // TODO: Fetch data from API
    setUpcomingAppointments([])
    setStats({
      totalAppointments: 0,
      upcomingAppointments: 0,
      completedAppointments: 0,
    })
  }, [])

  const quickActions = [
    {
      title: 'Find Doctors',
      description: 'Search and book appointments',
      icon: Search,
      href: '/patient/discover',
      color: 'primary',
    },
    {
      title: 'My Appointments',
      description: 'View and manage bookings',
      icon: Calendar,
      href: '/patient/appointments',
      color: 'success',
    },
    {
      title: 'Emergency',
      description: 'Book emergency appointment',
      icon: AlertCircle,
      href: '/patient/discover?emergency=true',
      color: 'emergency',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome back, {(user as any)?.name || 'Patient'}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your health appointments and discover trusted doctors
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Total Appointments
                </p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.totalAppointments}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Upcoming
                </p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.upcomingAppointments}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-success-500" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.completedAppointments}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                href={action.href}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 flex-shrink-0 ${
                    action.color === 'primary'
                      ? 'bg-primary-100 dark:bg-primary-900'
                      : action.color === 'success'
                      ? 'bg-success-100 dark:bg-success-900'
                      : 'bg-emergency-100 dark:bg-emergency-900'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      action.color === 'primary'
                        ? 'text-primary-500'
                        : action.color === 'success'
                        ? 'text-success-500'
                        : 'text-emergency-500'
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {action.description}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Upcoming Appointments
            </h2>
            <Link
              href="/patient/appointments"
              className="text-primary-500 hover:text-primary-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                No upcoming appointments
              </p>
              <Link href="/patient/discover" className="btn-primary">
                Book an Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {appointment.doctor?.name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(appointment.date, 'EEEE, MMMM d, yyyy')} at{' '}
                        {appointment.timeSlot.start}
                      </p>
                    </div>
                    {appointment.type === 'emergency' && (
                      <span className="px-2 py-1 bg-emergency-100 text-emergency-700 text-xs rounded">
                        Emergency
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


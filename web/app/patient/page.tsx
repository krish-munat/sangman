'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Calendar, Search, AlertCircle, TrendingUp, Clock,
  Zap, FlaskConical, Pill, FileText, Heart, Mic,
  Stethoscope, ChevronRight, Sparkles, Shield, PhoneCall, Droplet
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { useAppointmentStore } from '@/lib/store/appointmentStore'
import { formatDate } from '@/lib/utils/format'
import type { Appointment } from '../../../shared/types'

// Lazy load VoiceSearchInput (non-critical, heavy dependency)
const VoiceSearchInput = dynamic(() => import('@/components/search/VoiceSearchInput'), {
  ssr: false,
  loading: () => (
    <input
      type="text"
      placeholder="Loading search..."
      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600"
      disabled
    />
  )
})

export default function PatientHomePage() {
  const { user } = useAuthStore()
  const appointments = useAppointmentStore((state) => state.appointments)
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  })

  useEffect(() => {
    // Filter appointments for current user
    if (user?.id) {
      const userAppointments = appointments.filter(
        (a: any) => a.patientId === user.id || a.patient?.id === user.id
      )
      const upcoming = userAppointments.filter(
        (a: any) => a.status === 'confirmed' || a.status === 'pending'
      )
      const completed = userAppointments.filter((a: any) => a.status === 'completed')
      
      setUpcomingAppointments(upcoming.slice(0, 3))
      setStats({
        totalAppointments: userAppointments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
      })
    }
  }, [appointments, user])

  // Sangman exclusive services
  const sangmanServices = [
    {
      title: 'Sangman Now',
      description: 'Medicines in 15 mins',
      icon: Zap,
      href: '/patient/pharmacy',
      gradient: 'from-emerald-500 to-teal-500',
      badge: '⚡ Fast',
    },
    {
      title: 'Lab Tests',
      description: 'Home collection with escrow',
      icon: FlaskConical,
      href: '/patient/labs',
      gradient: 'from-sky-500 to-indigo-500',
      badge: '🔒 Safe',
    },
    {
      title: 'Pill Wallet',
      description: 'Track meds, earn rewards',
      icon: Pill,
      href: '/patient/medications',
      gradient: 'from-purple-500 to-pink-500',
      badge: '💰 Earn',
    },
    {
      title: 'Health Reports',
      description: 'AI-decoded lab reports',
      icon: FileText,
      href: '/patient/reports',
      gradient: 'from-indigo-500 to-purple-500',
      badge: '🤖 AI',
    },
  ]

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 py-8">
      {/* Emergency Action Bar - Top Right */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
        {/* Ambulance Button */}
        <button
          onClick={() => window.location.href = 'tel:108'}
          className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full shadow-lg
            flex items-center justify-center group transition-all hover:scale-110
            active:scale-95"
          title="Call Ambulance (108)"
        >
          <PhoneCall className="w-7 h-7 text-white" />
        </button>

        {/* Blood Donation Button */}
        <Link
          href="/patient/blood-donation"
          className="w-14 h-14 bg-rose-500 hover:bg-rose-600 rounded-full shadow-lg
            flex items-center justify-center group transition-all hover:scale-110
            active:scale-95"
          title="Blood Donation"
        >
          <Droplet className="w-7 h-7 text-white" />
        </Link>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Section with Voice Search */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Hello, {(user as any)?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                How can we help you today?
              </p>
            </div>
          </div>
          
          {/* Voice-First Search */}
          <div className="max-w-2xl">
            <VoiceSearchInput 
              placeholder="Search doctors, symptoms, or say 'Pet me dard'..."
              autoNavigate={true}
            />
            <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
              <Mic className="w-4 h-4" />
              <span>Voice search supports Hindi & English</span>
            </p>
          </div>
        </div>

        {/* Sangman Exclusive Services */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sangman Exclusive
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sangmanServices.map((service) => {
              const Icon = service.icon
              return (
                <Link
                  key={service.title}
                  href={service.href}
                  prefetch={true}
                  className="relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm
                    hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700
                    group overflow-hidden"
                >
                  {/* Badge */}
                  <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 
                    bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    {service.badge}
                  </span>
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl 
                    flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {service.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Trust Banner */}
        <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Sangman Trust Engine™</h3>
              <p className="text-white/80 text-sm">
                Your payments are held securely until service is delivered. 100% refund guaranteed.
              </p>
            </div>
            <Link 
              href="/patient/discover" 
              className="hidden md:flex items-center gap-1 bg-white/20 px-4 py-2 rounded-lg 
                hover:bg-white/30 transition-colors font-medium"
            >
              Book with Trust
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Total Appointments
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalAppointments}
                </p>
              </div>
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Upcoming
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.upcomingAppointments}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.completedAppointments}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  prefetch={true}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm
                    hover:shadow-md transition-all border border-gray-100 dark:border-gray-700
                    flex items-center gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      action.color === 'primary'
                        ? 'bg-sky-100 dark:bg-sky-900/30'
                        : action.color === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        action.color === 'primary'
                          ? 'text-sky-500'
                          : action.color === 'success'
                          ? 'text-emerald-500'
                          : 'text-red-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Appointments
            </h2>
            <Link
              href="/patient/appointments"
              className="text-sky-500 hover:text-sky-600 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No upcoming appointments
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Book a consultation with a verified doctor today
              </p>
              <Link 
                href="/patient/discover" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 
                  text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg"
              >
                <Search className="w-5 h-5" />
                Find Doctors
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment: any, index) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full 
                    flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {appointment.doctor?.name || appointment.doctorName || 'Doctor'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(appointment.date, 'EEEE, MMMM d')} at{' '}
                      {appointment.timeSlot?.start || appointment.time}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.type === 'emergency'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                  }`}>
                    {appointment.type === 'emergency' ? 'Emergency' : 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

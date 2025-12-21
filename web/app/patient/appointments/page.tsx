'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Star, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { useAppointmentStore } from '@/lib/store/appointmentStore'
import type { Appointment } from '../../../../shared/types'
import { formatDate, formatTimeSlot, formatCurrency } from '@/lib/utils/format'
import toast from 'react-hot-toast'

export default function AppointmentsPage() {
  const { user } = useAuthStore()
  const { appointments: storedAppointments, getAppointmentsByPatient, cancelAppointment, isHydrated } = useAppointmentStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'completed'>('all')

  useEffect(() => {
    if (!user?.id || !isHydrated) return
    
    // Get appointments from the store
    const patientAppointments = getAppointmentsByPatient(user.id)
    
    // If no stored appointments, show demo data
    if (patientAppointments.length === 0) {
      const mockAppointments: Appointment[] = [
        {
          id: 'demo-1',
          patientId: user.id,
          doctorId: 'doc-1',
          doctor: {
            id: 'doc-1',
            email: 'dr.sharma@example.com',
            phone: '+919876543210',
            role: 'doctor',
            name: 'Dr. Rajesh Sharma',
            specializations: ['Cardiology'],
            experience: 15,
            qualifications: ['MBBS', 'MD'],
            clinicAddress: {
              street: '123 Medical Street',
              city: 'Delhi',
              state: 'Delhi',
              zipCode: '110001',
              coordinates: { latitude: 28.6139, longitude: 77.2090 },
            },
            consultationFee: 500,
            availability: { days: {}, timezone: 'Asia/Kolkata' },
            emergencyAvailable: true,
            verified: true,
            verificationStatus: 'approved',
            rating: 4.8,
            totalReviews: 120,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          timeSlot: { start: '10:00', end: '11:00', available: false },
          type: 'normal',
          status: 'confirmed',
          otp: '123456',
          otpVerified: false,
          payment: {
            consultationFee: 500,
            platformFee: 35,
            totalAmount: 535,
            status: 'completed',
            paymentMethod: 'card',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      setAppointments(mockAppointments)
    } else {
      setAppointments(patientAppointments)
    }
  }, [user?.id, isHydrated, storedAppointments, getAppointmentsByPatient])

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true
    if (filter === 'upcoming') {
      const aptDate = new Date(`${apt.date}T${apt.timeSlot.start}`)
      return aptDate > new Date() && apt.status !== 'completed' && apt.status !== 'cancelled'
    }
    if (filter === 'past') {
      const aptDate = new Date(`${apt.date}T${apt.timeSlot.start}`)
      return aptDate < new Date()
    }
    if (filter === 'completed') return apt.status === 'completed'
    return true
  })

  const handleCancel = async (appointmentId: string) => {
    try {
      // Check if it's a demo appointment
      if (appointmentId.startsWith('demo-')) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
          )
        )
      } else {
        // Cancel in store
        cancelAppointment(appointmentId)
      }
      toast.success('Appointment cancelled successfully')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to cancel appointment'
      toast.error(errorMessage)
    }
  }

  const handleReview = (appointmentId: string) => {
    try {
      toast('Review feature coming soon', {
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      })
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to open review'
      toast.error(errorMessage)
    }
  }

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'rejected':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            My Appointments
          </h1>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'upcoming', 'past', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 text-center border border-neutral-200 dark:border-neutral-700">
            <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No appointments found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {filter === 'all' 
                ? "You haven't booked any appointments yet."
                : `No ${filter} appointments to show.`}
            </p>
            <a
              href="/patient/discover"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Find Doctors
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                          {appointment.doctor?.name}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {appointment.doctor?.specializations.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.type === 'emergency' && (
                          <span className="px-2 py-1 bg-emergency-100 text-emergency-700 dark:bg-emergency-900/30 dark:text-emergency-400 text-xs rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Emergency
                          </span>
                        )}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{formatDate(appointment.date, 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{formatTimeSlot(appointment.timeSlot.start, appointment.timeSlot.end)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{appointment.doctor?.clinicAddress.street},{' '}
                        {appointment.doctor?.clinicAddress.city}</span>
                      </div>
                    </div>

                    {/* OTP Display */}
                    {appointment.otp && !appointment.otpVerified && appointment.status === 'confirmed' && (
                      <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl mb-4">
                        <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                          Your OTP for clinic visit:
                        </p>
                        <p className="text-3xl font-bold text-primary-500">{appointment.otp}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                          Show this to the doctor at the clinic
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Amount Paid:
                        </span>
                        <span className="ml-2 font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(appointment.payment.totalAmount)}
                        </span>
                        {appointment.payment.transactionId && (
                          <span className="ml-2 text-xs text-neutral-500">
                            (TXN: {appointment.payment.transactionId})
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        {appointment.status === 'completed' && (
                          <button
                            onClick={() => handleReview(appointment.id)}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

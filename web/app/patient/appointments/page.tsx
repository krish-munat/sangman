'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Star, CheckCircle, X, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import type { Appointment } from '../../../../shared/types'
import { formatDate, formatTimeSlot, formatCurrency } from '@/lib/utils/format'
import toast from 'react-hot-toast'

export default function AppointmentsPage() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'completed'>('all')

  useEffect(() => {
    // Mock data - works without backend
    if (!user?.id) return
    
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientId: user?.id || '',
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
  }, [user?.id])

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true
    if (filter === 'upcoming') {
      const aptDate = new Date(`${apt.date}T${apt.timeSlot.start}`)
      return aptDate > new Date() && apt.status !== 'completed'
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
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
        )
      )
      toast.success('Appointment cancelled')
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          My Appointments
        </h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', 'upcoming', 'past', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No appointments found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="card">
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
                      {appointment.type === 'emergency' && (
                        <span className="px-2 py-1 bg-emergency-100 text-emergency-700 text-xs rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Emergency
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="icon-text-group text-sm text-neutral-600 dark:text-neutral-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{formatDate(appointment.date, 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="icon-text-group text-sm text-neutral-600 dark:text-neutral-400">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{formatTimeSlot(appointment.timeSlot.start, appointment.timeSlot.end)}</span>
                      </div>
                      <div className="icon-text-group text-sm text-neutral-600 dark:text-neutral-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{appointment.doctor?.clinicAddress.street},{' '}
                        {appointment.doctor?.clinicAddress.city}</span>
                      </div>
                    </div>

                    {appointment.otp && !appointment.otpVerified && (
                      <div className="bg-primary-50 dark:bg-primary-900 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                          Your OTP for clinic visit:
                        </p>
                        <p className="text-2xl font-bold text-primary-500">{appointment.otp}</p>
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
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            className="btn-outline text-sm"
                          >
                            Cancel
                          </button>
                        )}
                        {appointment.status === 'completed' && (
                          <button
                            onClick={() => handleReview(appointment.id)}
                            className="btn-primary text-sm btn-icon"
                          >
                            <Star className="w-4 h-4" />
                            <span>Review</span>
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

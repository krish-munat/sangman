'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, CheckCircle, X, AlertCircle, MapPin } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { formatDate, formatTimeSlot, formatCurrency } from '@/lib/utils/format'
import type { Appointment } from '../../../../shared/types'
import toast from 'react-hot-toast'

export default function DoctorAppointmentsPage() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'today'>('all')

  useEffect(() => {
    // Mock data - works without backend
    if (!user?.id) return
    
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientId: 'pat-1',
        doctorId: user?.id || '',
        patient: {
          id: 'pat-1',
          email: 'patient@example.com',
          phone: '+919876543210',
          role: 'patient',
          name: 'John Doe',
          age: 35,
          gender: 'male',
          emergencyContact: {
            name: 'Jane Doe',
            phone: '+919876543211',
            relation: 'Spouse',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        timeSlot: { start: '10:00', end: '11:00', available: false },
        type: 'normal',
        status: 'pending',
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
    if (filter === 'pending') return apt.status === 'pending'
    if (filter === 'confirmed') return apt.status === 'confirmed'
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      return apt.date === today
    }
    return true
  })

  const handleAccept = async (appointmentId: string) => {
    try {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'confirmed' as const } : apt
        )
      )
      toast.success('Appointment confirmed')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to accept appointment'
      toast.error(errorMessage)
    }
  }

  const handleReject = async (appointmentId: string) => {
    try {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'rejected' as const } : apt
        )
      )
      toast.success('Appointment rejected')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to reject appointment'
      toast.error(errorMessage)
    }
  }

  const handleVerifyOTP = async (appointmentId: string, otp: string) => {
    try {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, otpVerified: true } : apt
        )
      )
      toast.success('OTP verified. Treatment can begin.')
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to verify OTP'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Appointments
        </h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['all', 'pending', 'confirmed', 'today'] as const).map((f) => (
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
            <p className="text-neutral-600 dark:text-neutral-400">No appointments found</p>
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
                          {appointment.patient?.name || 'Patient'}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Age: {appointment.patient?.age} | {appointment.patient?.gender}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {appointment.type === 'emergency' && (
                          <span className="px-2 py-1 bg-emergency-100 text-emergency-700 text-xs rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Emergency
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            appointment.status === 'confirmed'
                              ? 'bg-success-100 text-success-700'
                              : appointment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
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
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span>{appointment.patient?.phone}</span>
                      </div>
                    </div>

                    {appointment.otp && !appointment.otpVerified && (
                      <div className="bg-primary-50 dark:bg-primary-900 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                          Patient OTP Verification
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter OTP"
                            className="input flex-1"
                            maxLength={6}
                          />
                          <button
                            onClick={() => handleVerifyOTP(appointment.id, '123456')}
                            className="btn-primary"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}

                    {appointment.otpVerified && (
                      <div className="bg-success-50 dark:bg-success-900 p-3 rounded-lg mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success-500" />
                        <span className="text-sm text-success-700 dark:text-success-300">
                          OTP Verified - Treatment can begin
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Consultation Fee:
                        </span>
                        <span className="ml-2 font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(appointment.payment.totalAmount)}
                        </span>
                      </div>
                      {appointment.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(appointment.id)}
                            className="btn-outline text-sm"
                          >
                            <X className="w-4 h-4 inline mr-1" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleAccept(appointment.id)}
                            className="btn-primary text-sm"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Accept
                          </button>
                        </div>
                      )}
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

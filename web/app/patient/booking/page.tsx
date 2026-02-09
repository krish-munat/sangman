'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, AlertCircle, CreditCard, CheckCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import type { Doctor, Appointment, Patient, Payment } from '../../../../shared/types'
import { calculatePayment, generateOTP } from '@/lib/utils/calculations'
import { formatCurrency, formatDate, formatTimeSlot } from '@/lib/utils/format'
import { validateFutureDate, handleError } from '@/lib/utils/errorHandler'
import toast from 'react-hot-toast'

function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get('doctorId')
  const { user } = useAuthStore()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null)
  const [isEmergency, setIsEmergency] = useState(false)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [step, setStep] = useState<'date' | 'time' | 'payment' | 'confirmation'>('date')
  const [bookingFor, setBookingFor] = useState<'self' | 'other'>('self')
  const [otherPatientDetails, setOtherPatientDetails] = useState({
    name: '',
    age: '',
    phone: '',
    gender: 'male' as 'male' | 'female' | 'other'
  })
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const [showPastAppointments, setShowPastAppointments] = useState(false)

  useEffect(() => {
    if (doctorId) {
      const mockDoctor: Doctor = {
        id: doctorId,
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
        emergencyFee: 1000,
        availability: {
          days: {
            monday: {
              available: true,
              slots: [
                { start: '09:00', end: '10:00', available: true },
                { start: '10:00', end: '11:00', available: true },
                { start: '14:00', end: '15:00', available: true },
              ],
            },
          },
          timezone: 'Asia/Kolkata',
        },
        emergencyAvailable: true,
        verified: true,
        verificationStatus: 'approved',
        rating: 4.8,
        totalReviews: 120,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setDoctor(mockDoctor)

      // Load past appointments with this doctor
      if (user?.id) {
        const mockPastAppointments: Appointment[] = [
          {
            id: 'apt-past-1',
            patientId: user.id,
            doctorId: doctorId,
            date: '2024-01-15',
            timeSlot: { start: '10:00', end: '11:00', available: false },
            type: 'normal',
            status: 'completed',
            otpVerified: true,
            payment: {
              consultationFee: 500,
              platformFee: 35,
              totalAmount: 535,
              status: 'completed',
              paymentMethod: 'card'
            },
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString()
          }
        ]
        setPastAppointments(mockPastAppointments)
      }
    }
  }, [doctorId, user])

  useEffect(() => {
    if (doctor && selectedDate && selectedTimeSlot) {
      try {
        const calculatedPayment = calculatePayment(
          doctor.consultationFee,
          isEmergency,
          user as Patient,
          0.8
        )
        setPayment(calculatedPayment)
      } catch (error) {
        const errorMessage = handleError(error, 'Failed to calculate payment')
        toast.error(errorMessage)
      }
    } else {
      setPayment(null)
    }
  }, [doctor, selectedDate, selectedTimeSlot, isEmergency, user])

  const handleBookAgain = (appointment: Appointment) => {
    // Auto-fill from past appointment
    setIsEmergency(appointment.type === 'emergency')
    setShowPastAppointments(false)
    toast.success('Details pre-filled from your last appointment')
  }

  const handleDateSelect = (date: string) => {
    try {
      if (!validateFutureDate(date)) {
        toast.error('Please select a future date')
        return
      }
      setSelectedDate(date)
      setStep('time')
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to select date')
      toast.error(errorMessage)
    }
  }

  const handleTimeSelect = (slot: { start: string; end: string }) => {
    setSelectedTimeSlot(slot)
    setStep('payment')
  }

  const handlePayment = async () => {
    try {
      if (!selectedDate || !selectedTimeSlot || !payment) {
        toast.error('Please complete all booking details')
        return
      }

      if (!user?.id) {
        toast.error('Please login to continue')
        router.push('/auth/login?role=patient')
        return
      }

      if (!validateFutureDate(selectedDate)) {
        toast.error('Please select a valid future date')
        return
      }

      const otp = generateOTP()
      toast.success(`Booking confirmed! OTP: ${otp}`)
      setStep('confirmation')
    } catch (error) {
      const errorMessage = handleError(error, 'Payment failed. Please try again.')
      toast.error(errorMessage)
    }
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading doctor details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Book Appointment
          </h1>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{doctor.name}</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              {doctor.specializations.join(', ')}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
              📍 {doctor.clinicAddress.street}, {doctor.clinicAddress.city}
            </p>
          </div>
        </div>

        {/* Past Appointments (if any) */}
        {pastAppointments.length > 0 && (
          <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 border border-sky-200 dark:border-sky-800 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-100 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Previous Visit{pastAppointments.length > 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => setShowPastAppointments(!showPastAppointments)}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
              >
                {showPastAppointments ? 'Hide' : 'Show'} ({pastAppointments.length})
              </button>
            </div>

            {showPastAppointments && (
              <div className="space-y-2">
                {pastAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white dark:bg-neutral-800 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {formatDate(apt.date, 'MMM d, yyyy')} at {apt.timeSlot.start}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {apt.type === 'emergency' ? 'Emergency' : 'Normal'} • ₹{apt.payment.totalAmount}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBookAgain(apt)}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Book Again
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Emergency Toggle */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="w-5 h-5 text-emergency-500 rounded focus:ring-emergency-500"
            />
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emergency-500" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Emergency Appointment
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Higher fees apply for emergency bookings
              </p>
            </div>
          </label>
        </div>

        {/* Book For Toggle */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 mb-6">
          <div className="mb-4">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
              Booking for:
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setBookingFor('self')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  bookingFor === 'self'
                    ? 'bg-sky-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                Myself
              </button>
              <button
                onClick={() => setBookingFor('other')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  bookingFor === 'other'
                    ? 'bg-sky-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                Someone Else
              </button>
            </div>
          </div>

          {/* Patient Details Form (shown when booking for someone else) */}
          {bookingFor === 'other' && (
            <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={otherPatientDetails.name}
                  onChange={(e) => setOtherPatientDetails({ ...otherPatientDetails, name: e.target.value })}
                  placeholder="Enter patient's full name"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600
                    bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={otherPatientDetails.age}
                    onChange={(e) => setOtherPatientDetails({ ...otherPatientDetails, age: e.target.value })}
                    placeholder="Age"
                    min="0"
                    max="150"
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600
                      bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                      focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={otherPatientDetails.gender}
                    onChange={(e) => setOtherPatientDetails({ ...otherPatientDetails, gender: e.target.value as 'male' | 'female' | 'other' })}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600
                      bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                      focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={otherPatientDetails.phone}
                  onChange={(e) => setOtherPatientDetails({ ...otherPatientDetails, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600
                    bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                    focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                * These details will be used for the appointment and OTP verification
              </p>
            </div>
          )}
        </div>

        {/* Booking Steps */}
        {step === 'date' && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <Calendar className="w-5 h-5 text-primary-500" />
              Select Date
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {getAvailableDates().map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedDate === date
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300'
                  }`}
                >
                  <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {formatDate(date, 'EEE')}
                  </div>
                  <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {formatDate(date, 'd')}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatDate(date, 'MMM')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'time' && selectedDate && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <Clock className="w-5 h-5 text-primary-500" />
                Select Time
              </h3>
              <button
                onClick={() => setStep('date')}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Change Date
              </button>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {doctor.availability.days.monday?.slots
                ?.filter((slot) => slot.available)
                .map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSelect(slot)}
                    className="p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-all text-center text-neutral-900 dark:text-neutral-100 font-medium"
                  >
                    {formatTimeSlot(slot.start, slot.end)}
                  </button>
                ))}
            </div>
          </div>
        )}

        {step === 'payment' && payment && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
              <CreditCard className="w-5 h-5 text-primary-500" />
              Payment Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Consultation Fee</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{formatCurrency(payment.consultationFee)}</span>
              </div>
              {payment.emergencySurcharge && payment.emergencySurcharge > 0 && (
                <div className="flex justify-between text-emergency-600">
                  <span>Emergency Surcharge</span>
                  <span className="font-medium">+{formatCurrency(payment.emergencySurcharge)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Platform Fee (7%)</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{formatCurrency(payment.platformFee)}</span>
              </div>
              {payment.subscriptionDiscount && payment.subscriptionDiscount > 0 && (
                <div className="flex justify-between text-success-600">
                  <span>Subscription Discount</span>
                  <span className="font-medium">-{formatCurrency(payment.subscriptionDiscount)}</span>
                </div>
              )}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between text-lg font-bold">
                <span className="text-neutral-900 dark:text-neutral-100">Total Amount</span>
                <span className="text-primary-500">{formatCurrency(payment.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Pay {formatCurrency(payment.totalAmount)}
            </button>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 border border-neutral-200 dark:border-neutral-700 text-center">
            <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Appointment Confirmed!
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Your appointment has been booked successfully.
            </p>
            <div className="bg-primary-50 dark:bg-primary-900 p-6 rounded-lg mb-6">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                Your OTP for clinic visit:
              </p>
              <p className="text-4xl font-bold text-primary-500">123456</p>
              <p className="text-xs text-neutral-500 mt-2">
                Show this OTP to the doctor at the clinic
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => router.push('/patient/appointments')}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                View Appointments
              </button>
              <button
                onClick={() => router.push('/patient/discover')}
                className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Find More Doctors
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">Loading booking...</p>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingLoading />}>
      <BookingForm />
    </Suspense>
  )
}

'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, AlertCircle, CreditCard, CheckCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { useAppointmentStore } from '@/lib/store/appointmentStore'
import type { Doctor, Patient, Payment } from '../../../../shared/types'
import { calculatePayment } from '@/lib/utils/calculations'
import { formatCurrency, formatDate, formatTimeSlot } from '@/lib/utils/format'
import { validateFutureDate, handleError } from '@/lib/utils/errorHandler'
import PaymentModal from '@/components/payment/PaymentModal'
import toast from 'react-hot-toast'

function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get('doctorId')
  const { user } = useAuthStore()
  const { addAppointment } = useAppointmentStore()
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null)
  const [isEmergency, setIsEmergency] = useState(false)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [step, setStep] = useState<'date' | 'time' | 'payment' | 'confirmation'>('date')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [bookingOtp, setBookingOtp] = useState<string>('')

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
    }
  }, [doctorId])

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

  const handlePaymentClick = () => {
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

    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (transactionId: string, paymentMethod: 'card' | 'upi' | 'wallet') => {
    setShowPaymentModal(false)

    if (!doctor || !selectedTimeSlot || !payment) return

    try {
      // Add appointment to store
      const newAppointment = addAppointment({
        patientId: user?.id || '',
        doctorId: doctor.id,
        doctor: doctor,
        date: selectedDate,
        timeSlot: { ...selectedTimeSlot, available: false },
        type: isEmergency ? 'emergency' : 'normal',
        status: 'confirmed',
        otpVerified: false,
        payment: {
          ...payment,
          status: 'completed',
          transactionId: transactionId,
          paymentMethod: paymentMethod,
        },
      })

      setBookingOtp(newAppointment.otp || '')
      toast.success('Appointment booked successfully!')
      setStep('confirmation')
    } catch (error) {
      const errorMessage = handleError(error, 'Failed to create appointment')
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

            {/* Payment Methods Info */}
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl mb-6">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                💳 Multiple payment options available: UPI, Credit/Debit Card, Wallet
              </p>
            </div>

            <button
              onClick={handlePaymentClick}
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
              <p className="text-4xl font-bold text-primary-500">{bookingOtp}</p>
              <p className="text-xs text-neutral-500 mt-2">
                Show this OTP to the doctor at the clinic
              </p>
            </div>

            {/* Appointment Details */}
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg mb-6 text-left">
              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Appointment Details</h4>
              <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <p><strong>Doctor:</strong> {doctor.name}</p>
                <p><strong>Date:</strong> {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                <p><strong>Time:</strong> {selectedTimeSlot && formatTimeSlot(selectedTimeSlot.start, selectedTimeSlot.end)}</p>
                <p><strong>Type:</strong> {isEmergency ? 'Emergency' : 'Normal'}</p>
                <p><strong>Amount Paid:</strong> {payment && formatCurrency(payment.totalAmount)}</p>
              </div>
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

      {/* Payment Modal */}
      {showPaymentModal && payment && selectedTimeSlot && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          amount={payment.totalAmount}
          doctorName={doctor.name}
          appointmentDate={formatDate(selectedDate, 'MMMM d, yyyy')}
          appointmentTime={formatTimeSlot(selectedTimeSlot.start, selectedTimeSlot.end)}
        />
      )}
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

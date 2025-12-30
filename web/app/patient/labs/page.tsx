'use client'

import { useState } from 'react'
import { 
  FlaskConical, Search, MapPin, Clock, Calendar, 
  Shield, Home, CheckCircle, ChevronRight, Star,
  User, Phone, Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import EscrowStatusBadge from '@/components/payment/EscrowStatusBadge'

interface LabTest {
  id: string
  name: string
  description: string
  price: number
  turnaroundTime: string
  fasting: boolean
  popular: boolean
}

const labTests: LabTest[] = [
  { id: '1', name: 'Complete Blood Count (CBC)', description: 'Measures blood cells and hemoglobin', price: 350, turnaroundTime: '6 hours', fasting: false, popular: true },
  { id: '2', name: 'Lipid Profile', description: 'Cholesterol and triglycerides', price: 500, turnaroundTime: '12 hours', fasting: true, popular: true },
  { id: '3', name: 'Thyroid Profile (T3, T4, TSH)', description: 'Complete thyroid function', price: 650, turnaroundTime: '24 hours', fasting: false, popular: true },
  { id: '4', name: 'Vitamin D (25-OH)', description: 'Vitamin D deficiency check', price: 900, turnaroundTime: '24 hours', fasting: false, popular: true },
  { id: '5', name: 'Vitamin B12', description: 'B12 levels in blood', price: 700, turnaroundTime: '24 hours', fasting: false, popular: false },
  { id: '6', name: 'HbA1c (Diabetes)', description: '3-month blood sugar average', price: 450, turnaroundTime: '12 hours', fasting: false, popular: true },
  { id: '7', name: 'Liver Function Test (LFT)', description: 'Complete liver panel', price: 600, turnaroundTime: '12 hours', fasting: true, popular: false },
  { id: '8', name: 'Kidney Function Test (KFT)', description: 'Creatinine, urea, and more', price: 550, turnaroundTime: '12 hours', fasting: false, popular: false },
]

type BookingStep = 'select' | 'schedule' | 'payment' | 'confirmed'

export default function LabsPage() {
  const [step, setStep] = useState<BookingStep>('select')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [patientDetails, setPatientDetails] = useState({ name: '', phone: '', address: '' })
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingId, setBookingId] = useState('')

  const filteredTests = labTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0)

  const toggleTest = (test: LabTest) => {
    setSelectedTests(prev => {
      const exists = prev.find(t => t.id === test.id)
      if (exists) {
        return prev.filter(t => t.id !== test.id)
      }
      return [...prev, test]
    })
  }

  const handleProceedToSchedule = () => {
    if (selectedTests.length === 0) {
      toast.error('Please select at least one test')
      return
    }
    setStep('schedule')
    window.scrollTo(0, 0)
  }

  const handleProceedToPayment = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time')
      return
    }
    if (!patientDetails.name || !patientDetails.phone || !patientDetails.address) {
      toast.error('Please fill all patient details')
      return
    }
    setStep('payment')
    window.scrollTo(0, 0)
  }

  const handleConfirmBooking = async () => {
    setIsProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setBookingId(`LAB-${Date.now().toString().slice(-8)}`)
      setStep('confirmed')
      toast.success('Lab test booked successfully!')
      window.scrollTo(0, 0)
    } catch (error) {
      toast.error('Booking failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const timeSlots = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM']

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    return date.toISOString().split('T')[0]
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-8 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Lab Tests</h1>
              <p className="text-white/80">Home sample collection with escrow protection</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-6">
            {['select', 'schedule', 'payment', 'confirmed'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s 
                    ? 'bg-white text-sky-600' 
                    : ['select', 'schedule', 'payment', 'confirmed'].indexOf(step) > i
                      ? 'bg-white/50 text-white'
                      : 'bg-white/20 text-white/50'
                }`}>
                  {i + 1}
                </div>
                {i < 3 && (
                  <div className={`w-8 h-0.5 ${
                    ['select', 'schedule', 'payment', 'confirmed'].indexOf(step) > i
                      ? 'bg-white/50'
                      : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Step 1: Select Tests */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Trust Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Sangman Trust Protection</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Payment held in escrow until phlebotomist arrives
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lab tests..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Popular Tests */}
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Popular Tests
            </h2>

            <div className="space-y-3 mb-6">
              {filteredTests.map((test) => {
                const isSelected = selectedTests.find(t => t.id === test.id)
                return (
                  <button
                    key={test.id}
                    onClick={() => toggleTest(test)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{test.name}</h3>
                          {test.fasting && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                              Fasting
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {test.turnaroundTime}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sky-600">₹{test.price}</p>
                        <div className={`w-6 h-6 rounded-full border-2 mt-2 flex items-center justify-center ${
                          isSelected ? 'border-sky-500 bg-sky-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected Summary */}
            {selectedTests.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{selectedTests.length} tests selected</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">₹{totalPrice}</p>
                  </div>
                  <button
                    onClick={handleProceedToSchedule}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl
                      font-semibold hover:from-sky-600 hover:to-indigo-700 transition-all flex items-center gap-2"
                  >
                    Proceed
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Schedule */}
        {step === 'schedule' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Home Collection Info */}
            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl p-4 flex items-center gap-3">
              <Home className="w-6 h-6 text-sky-600" />
              <div>
                <p className="font-medium text-sky-800 dark:text-sky-300">Home Sample Collection</p>
                <p className="text-sm text-sky-600 dark:text-sky-400">
                  Our certified phlebotomist will visit your home
                </p>
              </div>
            </div>

            {/* Patient Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-500" />
                Patient Details
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={patientDetails.name}
                  onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={patientDetails.phone}
                  onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <textarea
                  placeholder="Complete Address for Home Collection"
                  value={patientDetails.address}
                  onChange={(e) => setPatientDetails({ ...patientDetails, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                Select Date
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.map((date) => {
                  const d = new Date(date)
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg text-center transition-all ${
                        selectedDate === date
                          ? 'bg-sky-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <p className="text-xs">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className="font-bold">{d.getDate()}</p>
                      <p className="text-xs">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-500" />
                Select Time
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl
                font-semibold hover:from-sky-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Payment
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-3">
                {selectedTests.map((test) => (
                  <div key={test.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{test.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{test.price}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-sky-600">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Escrow Info */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                    Sangman Vault Protection
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3">
                    Your payment will be held securely in Sangman Vault. The lab will only receive 
                    payment after our phlebotomist arrives at your location and collects the sample.
                  </p>
                  <EscrowStatusBadge status="HELD" amount={totalPrice} />
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Appointment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-IN', { 
                    weekday: 'long', day: 'numeric', month: 'long' 
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Patient</span>
                  <span className="font-medium">{patientDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address</span>
                  <span className="font-medium text-right max-w-[200px]">{patientDetails.address}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl
                font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all 
                disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Pay ₹{totalPrice} (Held in Escrow)
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Step 4: Confirmed */}
        {step === 'confirmed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your lab test has been scheduled successfully
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6 text-left">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-mono font-bold text-sky-600">{bookingId}</span>
              </div>
              <EscrowStatusBadge status="HELD" amount={totalPrice} />
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Our phlebotomist will arrive at your location on<br />
              <strong>{new Date(selectedDate).toLocaleDateString('en-IN', { 
                weekday: 'long', day: 'numeric', month: 'long' 
              })}</strong> at <strong>{selectedTime}</strong>
            </p>

            <button
              onClick={() => {
                setStep('select')
                setSelectedTests([])
                setSelectedDate('')
                setSelectedTime('')
                setPatientDetails({ name: '', phone: '', address: '' })
              }}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Book Another Test
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}


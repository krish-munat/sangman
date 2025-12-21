'use client'

import { useState } from 'react'
import { X, CreditCard, Smartphone, Wallet, CheckCircle, Copy, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import toast from 'react-hot-toast'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (transactionId: string, paymentMethod: 'card' | 'upi' | 'wallet') => void
  amount: number
  doctorName: string
  appointmentDate: string
  appointmentTime: string
}

// Dummy UPI payment ID for the merchant
const MERCHANT_UPI_ID = '9179970366@upi'

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  doctorName,
  appointmentDate,
  appointmentTime,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'select' | 'process' | 'success'>('select')
  const [transactionId, setTransactionId] = useState('')

  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  // UPI form state
  const [upiId, setUpiId] = useState('')

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID)
    toast.success('UPI ID copied!')
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setStep('process')

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate dummy transaction ID
    const txnId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase()
    setTransactionId(txnId)
    setStep('success')
    setIsProcessing(false)
  }

  const handleConfirm = () => {
    onSuccess(transactionId, paymentMethod)
  }

  const validateAndPay = () => {
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid card number')
        return
      }
      if (cardExpiry.length < 5) {
        toast.error('Please enter a valid expiry date')
        return
      }
      if (cardCvv.length < 3) {
        toast.error('Please enter a valid CVV')
        return
      }
      if (cardName.length < 2) {
        toast.error('Please enter cardholder name')
        return
      }
    } else if (paymentMethod === 'upi' && upiId.length < 5) {
      toast.error('Please enter a valid UPI ID')
      return
    }

    handlePayment()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {step === 'success' ? 'Payment Successful!' : 'Complete Payment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {step === 'select' && (
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Appointment Summary
              </h3>
              <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <p>Doctor: {doctorName}</p>
                <p>Date: {appointmentDate}</p>
                <p>Time: {appointmentTime}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Total Amount</span>
                  <span className="text-xl font-bold text-primary-500">{formatCurrency(amount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Select Payment Method
              </h3>
              <div className="space-y-2">
                {/* UPI */}
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-primary-500' : 'text-neutral-400'}`} />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">UPI Payment</p>
                    <p className="text-sm text-neutral-500">Pay using any UPI app</p>
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary-500' : 'text-neutral-400'}`} />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Credit/Debit Card</p>
                    <p className="text-sm text-neutral-500">Visa, Mastercard, RuPay</p>
                  </div>
                </button>

                {/* Wallet */}
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Wallet className={`w-6 h-6 ${paymentMethod === 'wallet' ? 'text-primary-500' : 'text-neutral-400'}`} />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Wallet</p>
                    <p className="text-sm text-neutral-500">Paytm, PhonePe, Amazon Pay</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Form based on method */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                    Pay to Merchant UPI ID:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg font-mono text-sm">
                      {MERCHANT_UPI_ID}
                    </code>
                    <button
                      onClick={handleCopyUPI}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Your UPI ID (for verification)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 
                      bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                      focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 
                      bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                      focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 
                        bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                        focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 
                        bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                        focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 
                      bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                      focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  You will be redirected to your preferred wallet app to complete the payment of {formatCurrency(amount)}.
                </p>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={validateAndPay}
              className="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold 
                hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              Pay {formatCurrency(amount)}
            </button>

            {/* Test Mode Notice */}
            <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
              🔒 This is a demo payment. No actual transaction will occur.
            </p>
          </div>
        )}

        {step === 'process' && (
          <div className="p-12 text-center">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Processing Payment
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Please wait while we process your payment...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Payment Successful!
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Your payment of {formatCurrency(amount)} has been received.
            </p>
            
            <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl mb-6">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Transaction ID</p>
              <p className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                {transactionId}
              </p>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold 
                hover:bg-primary-600 transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


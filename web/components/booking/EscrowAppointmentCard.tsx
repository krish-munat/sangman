'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Lock, Clock, CheckCircle, AlertTriangle, ArrowRight, MessageCircle } from 'lucide-react'
import { EscrowStatus, getEscrowStatusLabel, getEscrowStatusColor, useEscrowStore } from '@/lib/store/escrowStore'
import toast from 'react-hot-toast'

interface Doctor {
  id: string
  name: string
  specialty: string
  image?: string
}

interface EscrowAppointmentCardProps {
  doctor: Doctor
  appointmentId: string
  status: EscrowStatus
  amount: number
  platformFee: number
  appointmentDate: string
  appointmentTime: string
  onDispute?: () => void
  onViewDetails?: () => void
}

export function EscrowAppointmentCard({
  doctor,
  appointmentId,
  status,
  amount,
  platformFee,
  appointmentDate,
  appointmentTime,
  onDispute,
  onViewDetails,
}: EscrowAppointmentCardProps) {
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const { raiseDispute } = useEscrowStore()

  const isHeld = status === 'HELD_IN_ESCROW'
  const isCompleted = status === 'RELEASED_TO_DOCTOR' || status === 'CONSULTATION_COMPLETED'
  const isDisputed = status === 'DISPUTED' || status === 'REFUNDED'
  const canDispute = status === 'HELD_IN_ESCROW' || status === 'CONSULTATION_STARTED'

  // Calculate progress percentage based on status
  const getProgressPercent = () => {
    switch (status) {
      case 'INITIATED': return 10
      case 'HELD_IN_ESCROW': return 35
      case 'CONSULTATION_STARTED': return 60
      case 'CONSULTATION_COMPLETED': return 85
      case 'RELEASED_TO_DOCTOR': return 100
      case 'DISPUTED': return 50
      case 'REFUNDED': return 100
      default: return 0
    }
  }

  const handleRaiseDispute = () => {
    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute')
      return
    }
    
    raiseDispute(appointmentId, disputeReason)
    toast.success('Dispute raised successfully. Our team will contact you.')
    setShowDisputeModal(false)
    setDisputeReason('')
    onDispute?.()
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-slate-700 relative overflow-hidden"
      >
        {/* Trust Badge Background Watermark */}
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <ShieldCheck size={120} className="text-emerald-500" />
        </div>

        {/* Doctor Info */}
        <div className="flex gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-white text-xl font-bold ring-2 ring-white shadow-lg">
            {doctor.image ? (
              <img src={doctor.image} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              doctor.name.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{doctor.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-300">
              <Clock size={14} />
              <span>{appointmentDate} at {appointmentTime}</span>
            </div>
          </div>
        </div>

        {/* Escrow Trust Section */}
        <div className={`mt-4 rounded-xl p-4 border ${
          isDisputed 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className={isDisputed ? 'text-red-600' : 'text-emerald-600'} />
              <span className={`text-xs font-bold uppercase tracking-wide ${
                isDisputed ? 'text-red-800 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-300'
              }`}>
                Sangman Guarantee
              </span>
            </div>
            {isHeld && <Lock size={14} className="text-emerald-600" />}
            {isCompleted && <CheckCircle size={14} className="text-emerald-600" />}
            {isDisputed && <AlertTriangle size={14} className="text-red-600" />}
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercent()}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  isDisputed ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
            </div>
            
            {/* Progress Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Paid</span>
              <span>In Vault</span>
              <span>Consultation</span>
              <span>Released</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getEscrowStatusColor(status)}`}>
              {getEscrowStatusLabel(status)}
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Trust Message */}
          <p className={`text-xs mt-3 ${
            isDisputed ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'
          }`}>
            {isHeld && (
              <>💰 Your money is <b>safe in our vault</b>. We only release it after your consultation is successful.</>
            )}
            {status === 'CONSULTATION_STARTED' && (
              <>🏥 Consultation in progress. Payment will be released upon completion.</>
            )}
            {status === 'CONSULTATION_COMPLETED' && (
              <>✅ Consultation completed. Payment will be released to doctor within 24 hours.</>
            )}
            {status === 'RELEASED_TO_DOCTOR' && (
              <>✨ Payment has been successfully released to {doctor.name}.</>
            )}
            {status === 'DISPUTED' && (
              <>⚠️ Your dispute is under review. Our team will contact you within 24 hours.</>
            )}
            {status === 'REFUNDED' && (
              <>💸 Amount has been refunded to your original payment method.</>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          {canDispute && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm"
            >
              <AlertTriangle size={16} />
              Raise Dispute
            </button>
          )}
          
          <button
            onClick={onViewDetails}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            View Details
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>

      {/* Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDisputeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Raise a Dispute</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tell us what went wrong</p>
                </div>
              </div>

              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Please describe the issue (e.g., Doctor didn't show up, Wrong diagnosis, etc.)"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
                Your payment will be frozen until our team reviews this dispute. We typically resolve within 24-48 hours.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRaiseDispute}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Submit Dispute
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Simple Trust Badge for listings
export function EscrowTrustBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium ${className}`}>
      <ShieldCheck size={12} />
      <span>Money Safe Until Consulted</span>
    </div>
  )
}


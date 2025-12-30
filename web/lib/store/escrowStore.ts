import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Escrow Status Types
export type EscrowStatus = 
  | 'INITIATED'      // Payment started
  | 'HELD_IN_ESCROW' // Money safely held
  | 'CONSULTATION_STARTED' // Doctor started session
  | 'CONSULTATION_COMPLETED' // Session ended successfully
  | 'RELEASED_TO_DOCTOR' // Money released to doctor
  | 'DISPUTED'       // Patient raised dispute
  | 'REFUNDED'       // Money returned to patient

export interface EscrowTransaction {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  amount: number
  platformFee: number
  doctorPayout: number
  status: EscrowStatus
  paymentMethod: 'card' | 'upi' | 'wallet'
  transactionId?: string
  
  // Timestamps
  createdAt: string
  heldAt?: string
  consultationStartedAt?: string
  consultationCompletedAt?: string
  releasedAt?: string
  disputedAt?: string
  refundedAt?: string
  
  // Dispute details
  disputeReason?: string
  disputeResolution?: string
}

export interface EscrowSummary {
  totalHeld: number
  totalReleased: number
  totalDisputed: number
  pendingTransactions: number
}

interface EscrowState {
  transactions: EscrowTransaction[]
  
  // Actions
  initiateEscrow: (data: Omit<EscrowTransaction, 'id' | 'status' | 'createdAt' | 'platformFee' | 'doctorPayout'>) => EscrowTransaction
  holdInEscrow: (transactionId: string) => void
  startConsultation: (transactionId: string) => void
  completeConsultation: (transactionId: string) => void
  releaseToDoctor: (transactionId: string) => void
  raiseDispute: (transactionId: string, reason: string) => void
  resolveDispute: (transactionId: string, resolution: string, refund: boolean) => void
  
  // Getters
  getTransaction: (id: string) => EscrowTransaction | undefined
  getTransactionByAppointment: (appointmentId: string) => EscrowTransaction | undefined
  getPatientTransactions: (patientId: string) => EscrowTransaction[]
  getDoctorTransactions: (doctorId: string) => EscrowTransaction[]
  getDoctorEarnings: (doctorId: string) => EscrowSummary
}

const PLATFORM_FEE_PERCENT = 0.07 // 7%

export const useEscrowStore = create<EscrowState>()(
  persist(
    (set, get) => ({
      transactions: [],

      initiateEscrow: (data) => {
        const platformFee = Math.round(data.amount * PLATFORM_FEE_PERCENT)
        const doctorPayout = data.amount - platformFee
        
        const transaction: EscrowTransaction = {
          ...data,
          id: `escrow-${Date.now()}`,
          status: 'INITIATED',
          platformFee,
          doctorPayout,
          createdAt: new Date().toISOString(),
        }
        
        set((state) => ({
          transactions: [...state.transactions, transaction],
        }))
        
        return transaction
      },

      holdInEscrow: (transactionId) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transactionId
            ? { ...t, status: 'HELD_IN_ESCROW' as const, heldAt: new Date().toISOString() }
            : t
        ),
      })),

      startConsultation: (transactionId) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transactionId
            ? { ...t, status: 'CONSULTATION_STARTED' as const, consultationStartedAt: new Date().toISOString() }
            : t
        ),
      })),

      completeConsultation: (transactionId) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transactionId
            ? { ...t, status: 'CONSULTATION_COMPLETED' as const, consultationCompletedAt: new Date().toISOString() }
            : t
        ),
      })),

      releaseToDoctor: (transactionId) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transactionId
            ? { ...t, status: 'RELEASED_TO_DOCTOR' as const, releasedAt: new Date().toISOString() }
            : t
        ),
      })),

      raiseDispute: (transactionId, reason) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transactionId
            ? { ...t, status: 'DISPUTED' as const, disputedAt: new Date().toISOString(), disputeReason: reason }
            : t
        ),
      })),

      resolveDispute: (transactionId, resolution, refund) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === transactionId
            ? {
                ...t,
                status: refund ? 'REFUNDED' as const : 'RELEASED_TO_DOCTOR' as const,
                disputeResolution: resolution,
                refundedAt: refund ? new Date().toISOString() : undefined,
                releasedAt: !refund ? new Date().toISOString() : undefined,
              }
            : t
        ),
      })),

      getTransaction: (id) => get().transactions.find((t) => t.id === id),

      getTransactionByAppointment: (appointmentId) =>
        get().transactions.find((t) => t.appointmentId === appointmentId),

      getPatientTransactions: (patientId) =>
        get().transactions.filter((t) => t.patientId === patientId),

      getDoctorTransactions: (doctorId) =>
        get().transactions.filter((t) => t.doctorId === doctorId),

      getDoctorEarnings: (doctorId) => {
        const doctorTxns = get().getDoctorTransactions(doctorId)
        
        return {
          totalHeld: doctorTxns
            .filter((t) => t.status === 'HELD_IN_ESCROW' || t.status === 'CONSULTATION_STARTED' || t.status === 'CONSULTATION_COMPLETED')
            .reduce((sum, t) => sum + t.doctorPayout, 0),
          totalReleased: doctorTxns
            .filter((t) => t.status === 'RELEASED_TO_DOCTOR')
            .reduce((sum, t) => sum + t.doctorPayout, 0),
          totalDisputed: doctorTxns
            .filter((t) => t.status === 'DISPUTED' || t.status === 'REFUNDED')
            .reduce((sum, t) => sum + t.doctorPayout, 0),
          pendingTransactions: doctorTxns
            .filter((t) => ['HELD_IN_ESCROW', 'CONSULTATION_STARTED', 'CONSULTATION_COMPLETED'].includes(t.status))
            .length,
        }
      },
    }),
    {
      name: 'sangman-escrow-store',
    }
  )
)

// Helper to get human-readable status
export function getEscrowStatusLabel(status: EscrowStatus): string {
  const labels: Record<EscrowStatus, string> = {
    INITIATED: 'Payment Initiated',
    HELD_IN_ESCROW: 'Safely Held in Vault',
    CONSULTATION_STARTED: 'Consultation In Progress',
    CONSULTATION_COMPLETED: 'Consultation Completed',
    RELEASED_TO_DOCTOR: 'Payment Released',
    DISPUTED: 'Under Review',
    REFUNDED: 'Refunded',
  }
  return labels[status]
}

// Helper to get status color
export function getEscrowStatusColor(status: EscrowStatus): string {
  const colors: Record<EscrowStatus, string> = {
    INITIATED: 'text-gray-500 bg-gray-100',
    HELD_IN_ESCROW: 'text-blue-700 bg-blue-100',
    CONSULTATION_STARTED: 'text-amber-700 bg-amber-100',
    CONSULTATION_COMPLETED: 'text-green-700 bg-green-100',
    RELEASED_TO_DOCTOR: 'text-emerald-700 bg-emerald-100',
    DISPUTED: 'text-red-700 bg-red-100',
    REFUNDED: 'text-purple-700 bg-purple-100',
  }
  return colors[status]
}


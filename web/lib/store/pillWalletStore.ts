import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Medication reminder types
export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: 'daily' | 'twice_daily' | 'thrice_daily' | 'weekly' | 'as_needed'
  times: string[] // Array of times like ['08:00', '20:00']
  startDate: string
  endDate?: string
  notes?: string
  prescribedBy?: string
  isActive: boolean
}

export interface MedicationLog {
  id: string
  medicationId: string
  scheduledTime: string
  takenAt?: string
  status: 'pending' | 'taken' | 'missed' | 'skipped'
  date: string
  rewardEarned?: number
}

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit' | 'redeemed'
  amount: number
  description: string
  timestamp: string
  medicationLogId?: string
}

interface PillWalletState {
  medications: Medication[]
  logs: MedicationLog[]
  walletBalance: number
  transactions: WalletTransaction[]
  streak: number
  totalEarned: number
  
  // Medication Actions
  addMedication: (med: Omit<Medication, 'id' | 'isActive'>) => void
  updateMedication: (id: string, updates: Partial<Medication>) => void
  deleteMedication: (id: string) => void
  
  // Adherence Actions
  markAsTaken: (medicationId: string, scheduledTime: string) => void
  markAsMissed: (medicationId: string, scheduledTime: string) => void
  markAsSkipped: (medicationId: string, scheduledTime: string, reason?: string) => void
  
  // Wallet Actions
  redeemReward: (amount: number, description: string) => boolean
  
  // Getters
  getTodaysMedications: () => { medication: Medication; log: MedicationLog | null }[]
  getAdherenceRate: (days?: number) => number
  getMedicationHistory: (medicationId: string) => MedicationLog[]
}

const REWARD_PER_DOSE = 1 // ₹1 per dose taken on time

export const usePillWalletStore = create<PillWalletState>()(
  persist(
    (set, get) => ({
      medications: [],
      logs: [],
      walletBalance: 0,
      transactions: [],
      streak: 0,
      totalEarned: 0,

      addMedication: (med) => set((state) => ({
        medications: [
          ...state.medications,
          {
            ...med,
            id: `med-${Date.now()}`,
            isActive: true,
          },
        ],
      })),

      updateMedication: (id, updates) => set((state) => ({
        medications: state.medications.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      })),

      deleteMedication: (id) => set((state) => ({
        medications: state.medications.filter((m) => m.id !== id),
      })),

      markAsTaken: (medicationId, scheduledTime) => {
        const today = new Date().toISOString().split('T')[0]
        const now = new Date().toISOString()
        
        set((state) => {
          // Check if already logged
          const existingLog = state.logs.find(
            (l) => l.medicationId === medicationId && l.scheduledTime === scheduledTime && l.date === today
          )
          
          if (existingLog && existingLog.status === 'taken') {
            return state // Already taken
          }

          const newLog: MedicationLog = {
            id: `log-${Date.now()}`,
            medicationId,
            scheduledTime,
            takenAt: now,
            status: 'taken',
            date: today,
            rewardEarned: REWARD_PER_DOSE,
          }

          const newTransaction: WalletTransaction = {
            id: `txn-${Date.now()}`,
            type: 'credit',
            amount: REWARD_PER_DOSE,
            description: `Medicine taken on time`,
            timestamp: now,
            medicationLogId: newLog.id,
          }

          // Update streak
          const newStreak = state.streak + 1

          return {
            logs: [...state.logs.filter(
              (l) => !(l.medicationId === medicationId && l.scheduledTime === scheduledTime && l.date === today)
            ), newLog],
            transactions: [...state.transactions, newTransaction],
            walletBalance: state.walletBalance + REWARD_PER_DOSE,
            totalEarned: state.totalEarned + REWARD_PER_DOSE,
            streak: newStreak,
          }
        })
      },

      markAsMissed: (medicationId, scheduledTime) => {
        const today = new Date().toISOString().split('T')[0]
        
        set((state) => {
          const newLog: MedicationLog = {
            id: `log-${Date.now()}`,
            medicationId,
            scheduledTime,
            status: 'missed',
            date: today,
          }

          return {
            logs: [...state.logs.filter(
              (l) => !(l.medicationId === medicationId && l.scheduledTime === scheduledTime && l.date === today)
            ), newLog],
            streak: 0, // Reset streak on miss
          }
        })
      },

      markAsSkipped: (medicationId, scheduledTime) => {
        const today = new Date().toISOString().split('T')[0]
        
        set((state) => {
          const newLog: MedicationLog = {
            id: `log-${Date.now()}`,
            medicationId,
            scheduledTime,
            status: 'skipped',
            date: today,
          }

          return {
            logs: [...state.logs.filter(
              (l) => !(l.medicationId === medicationId && l.scheduledTime === scheduledTime && l.date === today)
            ), newLog],
          }
        })
      },

      redeemReward: (amount, description) => {
        const { walletBalance } = get()
        
        if (amount > walletBalance) {
          return false
        }

        set((state) => ({
          walletBalance: state.walletBalance - amount,
          transactions: [
            ...state.transactions,
            {
              id: `txn-${Date.now()}`,
              type: 'redeemed',
              amount,
              description,
              timestamp: new Date().toISOString(),
            },
          ],
        }))

        return true
      },

      getTodaysMedications: () => {
        const { medications, logs } = get()
        const today = new Date().toISOString().split('T')[0]
        const activeMeds = medications.filter((m) => m.isActive)

        return activeMeds.flatMap((medication) => {
          return medication.times.map((time) => {
            const log = logs.find(
              (l) => l.medicationId === medication.id && l.scheduledTime === time && l.date === today
            ) || null
            
            return { medication, log }
          })
        }).sort((a, b) => a.medication.times[0].localeCompare(b.medication.times[0]))
      },

      getAdherenceRate: (days = 7) => {
        const { logs } = get()
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        const recentLogs = logs.filter(
          (l) => new Date(l.date) >= cutoffDate
        )

        if (recentLogs.length === 0) return 100

        const takenCount = recentLogs.filter((l) => l.status === 'taken').length
        return Math.round((takenCount / recentLogs.length) * 100)
      },

      getMedicationHistory: (medicationId) => {
        return get().logs.filter((l) => l.medicationId === medicationId)
      },
    }),
    {
      name: 'sangman-pill-wallet',
    }
  )
)

// Helper functions
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function getFrequencyLabel(frequency: Medication['frequency']): string {
  const labels = {
    daily: 'Once daily',
    twice_daily: 'Twice daily',
    thrice_daily: 'Three times daily',
    weekly: 'Once a week',
    as_needed: 'As needed',
  }
  return labels[frequency]
}


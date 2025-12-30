'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Pill, 
  Wallet, 
  Check, 
  X, 
  Clock, 
  TrendingUp, 
  Gift,
  ChevronRight,
  Flame,
  Plus
} from 'lucide-react'
import { 
  usePillWalletStore, 
  formatTime, 
  getFrequencyLabel,
  type Medication 
} from '@/lib/store/pillWalletStore'
import toast from 'react-hot-toast'

export function PillWalletCard() {
  const { 
    walletBalance, 
    streak, 
    getTodaysMedications, 
    markAsTaken,
    markAsSkipped,
    getAdherenceRate 
  } = usePillWalletStore()
  
  const todaysMeds = getTodaysMedications()
  const adherenceRate = getAdherenceRate(7)
  const pendingMeds = todaysMeds.filter(m => !m.log || m.log.status === 'pending')

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Pill Wallet
          </h3>
          <p className="text-emerald-100 text-sm">Earn ₹1 for each dose taken on time!</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">₹{walletBalance}</p>
          <p className="text-emerald-200 text-xs">Available Balance</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-orange-300" />
            <span className="font-bold text-xl">{streak}</span>
          </div>
          <p className="text-xs text-emerald-100">Day Streak</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
          <p className="font-bold text-xl mb-1">{adherenceRate}%</p>
          <p className="text-xs text-emerald-100">Adherence</p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
          <p className="font-bold text-xl mb-1">{pendingMeds.length}</p>
          <p className="text-xs text-emerald-100">Pending</p>
        </div>
      </div>

      {/* Today's Medications */}
      {todaysMeds.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-100">Today's Schedule:</p>
          {todaysMeds.slice(0, 3).map(({ medication, log }, index) => (
            <MedicationItem
              key={`${medication.id}-${index}`}
              medication={medication}
              time={medication.times[index % medication.times.length]}
              status={log?.status || 'pending'}
              onTake={() => {
                markAsTaken(medication.id, medication.times[index % medication.times.length])
                toast.success('Great job! ₹1 added to your wallet 💰')
              }}
              onSkip={() => {
                markAsSkipped(medication.id, medication.times[index % medication.times.length])
                toast('Medication skipped', { icon: '⏭️' })
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <Pill className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
          <p className="text-sm">No medications scheduled for today</p>
          <button className="mt-2 text-xs underline text-emerald-200">
            Add Medication
          </button>
        </div>
      )}

      {/* Redeem Button */}
      {walletBalance >= 50 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
        >
          <Gift className="w-5 h-5" />
          Redeem ₹{walletBalance} Rewards
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  )
}

// Individual medication item
function MedicationItem({
  medication,
  time,
  status,
  onTake,
  onSkip,
}: {
  medication: Medication
  time: string
  status: 'pending' | 'taken' | 'missed' | 'skipped'
  onTake: () => void
  onSkip: () => void
}) {
  const isPending = status === 'pending'
  const isTaken = status === 'taken'

  return (
    <motion.div 
      className={`flex items-center justify-between p-3 rounded-xl ${
        isTaken 
          ? 'bg-white/30' 
          : 'bg-white/20'
      }`}
      animate={isTaken ? { scale: [1, 1.02, 1] } : {}}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isTaken ? 'bg-green-400' : 'bg-white/20'
        }`}>
          {isTaken ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Pill className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="font-medium">{medication.name}</p>
          <p className="text-xs text-emerald-100 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(time)} • {medication.dosage}
          </p>
        </div>
      </div>

      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={onTake}
            className="px-3 py-2 rounded-lg bg-white text-emerald-600 font-medium text-sm hover:bg-emerald-50 transition-colors flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Taken
          </button>
        </div>
      )}

      {isTaken && (
        <span className="text-xs bg-green-400 px-2 py-1 rounded-full font-medium">
          +₹1 Earned
        </span>
      )}
    </motion.div>
  )
}

// Add Medication Modal
export function AddMedicationButton({ onAdd }: { onAdd?: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
    >
      <Plus className="w-4 h-4" />
      Add Medication
    </button>
  )
}

// Mini wallet badge for navbar
export function WalletBadge() {
  const { walletBalance } = usePillWalletStore()

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
      <Wallet className="w-4 h-4" />
      <span>₹{walletBalance}</span>
    </div>
  )
}

